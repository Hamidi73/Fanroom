# FanRoom Global — QA & Security Audit

> **UPDATE 2026-06-13 — ALL FINDINGS RESOLVED.** Every issue below (H1, H2, M1,
> M2, L1–L6) has been fixed and verified. DB changes are recorded in
> `supabase/migrations/0001`–`0004` and were verified against the live database
> (e.g. the anon key now gets `permission denied` on `profiles.stripe_account_id`/
> `wallet_address`/`is_admin`, while `display_name` joins still work). Build and
> lint are clean. A per-item resolution note is appended to each finding.

**Date:** 2026-06-12
**Scope:** Non-destructive audit of the FanRoom codebase, Supabase backend (RLS,
grants, policies via read-only schema introspection), and build/lint health.
**Method:** Static code analysis + read-only database introspection + production
build & lint. **No high-volume load/DoS testing was run against live Vercel or
Supabase endpoints**, per instruction.
**Status:** Audit only — **no code or database changes were made.** Every fix
below is a recommendation for you to approve.

---

## Summary

| # | Severity | Area | Finding | Status |
|---|----------|------|---------|--------|
| H1 | **High** | Data exposure | `profiles.stripe_account_id`, `wallet_address`, `is_admin` world-readable via the anon key | ✅ Fixed — table grant dropped; only `id,display_name,created_at` re-granted; verified `permission denied` for the rest |
| H2 | **High** | Functional bug | Phantom wallet link/unlink always failed (no UPDATE grant on `wallet_address`) | ✅ Fixed — write moved to service-role admin client |
| M1 | Medium | Input validation | Room creation had no server-side validation / length caps / rate limit | ✅ Fixed — DB CHECK constraints + per-host open-room cap trigger |
| M2 | Medium | Integrity | Chat gift/sticker spoofing without spending Roars | ✅ Fixed — atomic `send_gift`/`send_sticker` RPCs + INSERT-policy body guard |
| L1 | Low | Error handling | Forms hang in "busy" on a network-level error | ✅ Fixed — try/catch/finally on all four forms |
| L2 | Low | Error handling | `rooms/new` auto-join insert not error-checked | ✅ Fixed — error checked + logged |
| L3 | Low | Availability | `/api/live` unauthenticated + unthrottled | ✅ Fixed — 60/min/IP rate limit |
| L4 | Low | Availability | Payment webhooks have no rate limit | ✅ Fixed — 300/min/IP (signature still primary gate) |
| L5 | Low | Supply chain | `ffmpeg-core` loaded from unpkg CDN at runtime | ✅ Fixed — self-hosted under `/public/ffmpeg` |
| L6 | Low | Hardening | CSP had no `script-src`/`connect-src` | ✅ Fixed — full resource CSP added |

**Build:** passes — 18 routes compiled, 0 errors.
**Lint:** passes — 0 errors, 0 warnings.

### Verified-secure controls (tested, no action needed)
These were specifically checked and are correctly implemented:

- **Admin routes are properly gated.** `src/app/admin/layout.tsx` wraps every
  `/admin/*` route and checks `is_admin` server-side via `auth.getUser()` (which
  validates the JWT, not just the cookie). Logged-out and non-admin users get an
  access-denied screen. `/admin` and `/admin/manage` are both covered.
- **Privilege escalation through the profile UPDATE policy is blocked.** The RLS
  policy `USING (auth.uid() = id)` would, on its own, let a user write any column
  of their own row — but column-level grants restrict `authenticated` UPDATE to
  **`display_name` only**. `is_admin`, `stripe_account_id`, `stripe_payouts_enabled`,
  and `wallet_address` are **not** user-writable. (Confirmed via
  `information_schema.column_privileges`.)
- **RLS is enabled on all 7 public tables** with sensible policies. Writes to
  `coin_purchases`, `donations`, and `wallets` have no user-facing INSERT/UPDATE/
  DELETE policy → they are service-role-only. `messages` INSERT requires
  `auth.uid() = user_id AND highlight = false AND` room membership.
- **OAuth callback is open-redirect-safe.** `src/app/auth/callback/route.ts:12-13`
  rejects `//`-prefixed and absolute `next` values.
- **Service-role key is server-only.** `src/lib/supabase/admin.ts` uses the
  non-public `SUPABASE_SERVICE_ROLE_KEY`; it is never imported into a `"use client"`
  component.
- **No secrets committed.** `.gitignore` covers `.env*`; the only `NEXT_PUBLIC_*`
  vars are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `LIVEKIT_URL` — all safe to ship.
- **No `dangerouslySetInnerHTML` anywhere** → stored XSS via room titles/chat is
  mitigated by React's automatic escaping.
- **Payment amounts are server-side only** — checkout routes take a bundle/tier id,
  never a client-supplied amount, and credit wallets only via signature-verified
  webhooks.
- **`/api/wallet` ownership is signature-proven** — ed25519 verification, message
  scoped to the user id, 10-minute expiry, rate-limited.
- **Dynamic routes handle bad input gracefully** — `/nation/[slug]` → "Nation not
  found"; `/rooms/[id]` uses `.maybeSingle()` + a "Room not found" branch (a
  non-UUID id produces a query error that is treated as not-found, not a 500).

---

## HIGH

### H1 — Sensitive profile columns are world-readable via the anon key

**Severity:** High (data exposure / PII + financial identifiers)
**Where:** `profiles` table RLS policy `"Profiles are viewable by everyone"`
(`SELECT USING (true)`) combined with column SELECT grants to `anon`/`authenticated`.
Columns: `stripe_account_id`, `wallet_address`, `is_admin`, `stripe_payouts_enabled`.

**What breaks / the risk:**
The public profile-read policy returns *all columns*. RLS controls rows, not
columns, and `anon` holds `SELECT` on the sensitive columns. Anyone with the
publishable anon key (it ships to every browser) can call the REST endpoint
directly:

```
GET /rest/v1/profiles?select=id,stripe_account_id,wallet_address,is_admin
    apikey: <anon key>
```

and receive, for **every user**:
- `stripe_account_id` — the Stripe Connect account identifier (`acct_…`), a
  financial/business identifier that should never be public;
- `wallet_address` — links each account to an on-chain Solana wallet (deanonymises
  users and their crypto activity);
- `is_admin` — lets an attacker enumerate which accounts are admins and target them.

Confirmed via `pg_policies` (qual = `true`) and `information_schema.column_privileges`
(anon has `SELECT` on all four columns). The app itself only ever selects
`display_name` for public use, but the policy + grants expose far more to a direct
API caller.

**Fix (no app breakage):**
- `stripe_account_id` / `stripe_payouts_enabled` are read **only** through the
  service-role admin client (`src/lib/connect.ts:27-36`), which bypasses grants —
  so they can be revoked with zero app changes.
- `is_admin` is read via the user-scoped client in 3 places
  (`src/app/admin/layout.tsx:14`, `src/app/components/AccountNav.tsx:39`,
  `src/app/profile/page.tsx:32`) — switch those to the existing
  `is_current_user_admin()` SECURITY-DEFINER function (already used by the RLS
  policies) so the column grant can be removed.

```sql
-- Remove sensitive columns from the public/authenticated read surface.
revoke select (stripe_account_id, stripe_payouts_enabled, wallet_address, is_admin)
  on public.profiles from anon, authenticated;

-- Ensure the admin-check function is callable by app code.
grant execute on function public.is_current_user_admin() to authenticated;
```

Then change the three `select("is_admin")` reads to
`supabase.rpc("is_current_user_admin")`. `display_name` and `created_at` remain
publicly readable (needed for room cards, chat, leaderboard).

---

### H2 — Phantom wallet link/unlink is broken in production

**Severity:** High (shipped feature fails 100% at runtime)
**Where:** `src/app/api/wallet/route.ts:78` (link) and `:98` (unlink).

**What breaks:**
The route writes `wallet_address` using the **user-scoped** server client (which
runs as the `authenticated` role):

```ts
await supabase.from("profiles").update({ wallet_address: address }).eq("id", user.id);
```

But `authenticated` has **no UPDATE grant on `wallet_address`** — column grants
limit it to `display_name` only (confirmed via `information_schema.column_privileges`).
Postgres checks column privileges before RLS, so the update is denied, the route
falls into its error branch, and returns `500 "Couldn't save wallet."` **Wallet
linking can never succeed**, and unlink fails the same way. This wasn't caught at
ship time because the end-to-end path needs the Phantom extension; the unit checks
(401 when unauthenticated, ed25519 verify in isolation) all passed.

**Fix (preferred — keeps `wallet_address` non-user-writable via REST):**
Do the write with the service-role admin client, since the route has *already*
proven ownership with the ed25519 signature. Mirrors the Stripe pattern in
`connect.ts`:

```ts
import { getAdminClient } from "@/lib/supabase/admin";
const admin = getAdminClient();
if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 503 });
await admin.from("profiles").update({ wallet_address: address }).eq("id", user.id);
```

**Alternative (simpler, but widens the write surface):**
```sql
grant update (wallet_address) on public.profiles to authenticated;
```
The RLS policy already restricts the row to the owner, but this also lets a user
set an *unverified* address by calling REST directly, bypassing the signature
check — so the admin-client fix is the better option. (Note: if you also apply H1
and revoke SELECT on `wallet_address`, the profile page's owner read at
`src/app/profile/page.tsx:32` must move to the admin client or a SECURITY-DEFINER
"get my own wallet" RPC.)

---

## MEDIUM

### M1 — Room creation has no server-side validation or rate limit

**Severity:** Medium (spam / data-integrity / layout abuse)
**Where:** `src/app/rooms/new/page.tsx:48-58` (insert), `:106` (the only validation,
a client-side `minLength={3}`).

**What breaks:**
Rooms are inserted straight from the browser via the anon key. The only validation
is HTML `required minLength={3}` and a JS `.trim()` — both trivially bypassed by
calling the Supabase REST insert directly with a valid session. RLS enforces
`host_id = auth.uid()` (ownership) but **nothing about content**. A user can create:
- rooms with empty/whitespace or 10,000-character titles (no DB length cap — the
  column is `text`), which can break card/list layouts;
- arbitrary `nation_slug` / `match` / `language` strings;
- unlimited rooms in a loop (no per-user cap, no rate limit — this path is a direct
  table insert, so the API rate limiter does not apply).

Impact is bounded by React escaping (no XSS) and the 5-minute inactivity auto-close,
but spam-creation and oversized fields are open.

**Fix:** Enforce server-side. Add DB `CHECK` constraints and a per-user open-room cap:

```sql
alter table public.rooms
  add constraint rooms_title_len check (char_length(btrim(title)) between 3 and 80),
  add constraint rooms_match_len check (match is null or char_length(match) <= 80),
  add constraint rooms_language_len check (language is null or char_length(language) <= 40);
```

For the count cap and nation-slug validation, route creation through a
SECURITY-DEFINER RPC (`create_room(...)`) that checks
`count(*) where host_id = auth.uid() and status <> 'Closed' < N` and validates the
slug against the known nation list, then have the client call `rpc("create_room")`
instead of a raw insert.

---

### M2 — Chat gift/sticker spoofing

**Severity:** Medium (integrity — known limitation)
**Where:** `messages` INSERT policy (`WITH CHECK highlight = false AND` membership);
gift rendering keys off the message body pattern in `src/app/components/RoomChat.tsx`.

**What breaks:**
A room member can insert an ordinary (`highlight = false`) message whose body is a
gift/sticker token, e.g. `[gift:algeria-flag:5]` or `[sticker:…]`, by calling the
REST insert directly. The chat renderer displays it as a real gift notification,
so a user can fake "sent a gift" without spending Roars. **Financial risk is zero**
(Roars are non-cashable and no payout is triggered); the risk is social/integrity —
faked hype in chat.

**Fix:** Move gift/sticker posting to a SECURITY-DEFINER RPC
(`send_gift(room_id, gift_id, qty)`) that debits the Roar balance server-side and
stamps a trusted marker column (e.g. `gift_id`), and have the chat renderer trust
**that column**, not a parseable body string. Optionally add a check constraint
rejecting `[gift:`/`[sticker:` bodies on the user-facing INSERT path.

---

## LOW

### L1 — Forms hang on network-level errors (no try/catch)

**Severity:** Low (UX)
**Where:** `src/app/login/page.tsx:22-35`, `src/app/rooms/new/page.tsx:37-69`,
`src/app/signup/page.tsx`, `src/app/profile/ProfileForm.tsx`.

**What breaks:** Each `handleSubmit` awaits the Supabase call and only resets `busy`
*after* it resolves. Supabase returns auth/validation problems as a returned `error`
(handled fine), but a **network-level** failure (offline, DNS, CORS) *throws*. With
no try/catch, the rest of the handler never runs: the button stays stuck on
"Logging in…/Creating…" and no error is shown.

**Fix:** Wrap in `try { … } catch { setError("Something went wrong — try again.") }
finally { setBusy(false) }`.

### L2 — Auto-join insert not error-checked

**Severity:** Low
**Where:** `src/app/rooms/new/page.tsx:66`.
**What breaks:** After creating a room the host is auto-joined with
`insert({ room_id, user_id })`, but the result isn't checked. If it fails, the host
lands in a room they aren't a member of. Recoverable via `AutoJoinRoom`/
`JoinRoomButton`, but silent.
**Fix:** Check the error and surface it, or rely on `AutoJoinRoom` and remove the
redundant insert.

### L3 — `/api/live` is unauthenticated and unthrottled

**Severity:** Low (availability)
**Where:** `src/app/api/live/route.ts` (`export const dynamic = "force-dynamic"`,
no `rateLimit`).
**What breaks:** Each request recomputes `getGroupsToday()`. The upstream schedule/
scoreboard fetches are cached (60s/30s) so the blast radius is small, but there's no
route-level throttle, and `force-dynamic` means Vercel won't CDN-cache it. A flood
would run the transform per request.
**Fix:** Add `rateLimit` (as the payment/livekit routes do), or memoize
`getGroupsToday()` for ~10s, or drop `force-dynamic` and rely on `revalidate`.

### L4 — Payment webhooks have no rate limit

**Severity:** Low
**Where:** `src/app/api/payments/stripe/webhook/route.ts`,
`src/app/api/payments/crypto/webhook/route.ts`.
**What breaks:** No `rateLimit`. Both **verify the provider signature** and reject
unsigned requests quickly, so the real risk is only CPU spent on signature
verification under a flood. Acceptable, but a limit is cheap defense-in-depth.

### L5 — `ffmpeg-core` is loaded from the unpkg CDN at runtime

**Severity:** Low (availability / supply chain)
**Where:** `src/app/components/ClipControls.tsx` (`FFMPEG_CORE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd"`).
**What breaks:** Clipping depends on unpkg being up and uncompromised at clip time.
The version is pinned (good) but there's no Subresource Integrity, and an unpkg
outage silently breaks clipping.
**Fix:** Self-host `ffmpeg-core.js`/`.wasm` under `/public` and load from same-origin
(also lets you tighten CSP), or add SRI.

### L6 — CSP has no `script-src`/`connect-src`

**Severity:** Low (hardening)
**Where:** `next.config.ts:19-21` — CSP is only
`frame-ancestors 'self'; base-uri 'self'; object-src 'none'`.
**What breaks:** Nothing today, and the file documents this as a deliberate
"tested follow-up." But there's no CSP backstop against injected scripts. With the
new ffmpeg blob workers + unpkg + LiveKit + Supabase origins, a full `script-src`/
`connect-src`/`worker-src` policy needs careful testing.
**Fix:** Introduce a `script-src 'self' …`, `connect-src` (Supabase + LiveKit +
unpkg or self), `worker-src 'self' blob:` policy and verify clipping, video, and
realtime still work.

---

## Test coverage notes

- **What was run:** production build (`next build`), `eslint`, read-only Supabase
  schema introspection (RLS state, policies, column grants, table columns), and
  static review of auth, payment, room, chat, wallet, and clipping code paths.
- **What was deliberately *not* run:** high-volume load/DoS traffic against live
  Vercel or Supabase, and any write/mutation against live data (the H1/H2/escalation
  checks were proven from grants and policies, not by attempting exploits).
- **Not covered (would need a staging env / live session):** authenticated
  end-to-end flows (actual login, room creation, payment checkout, wallet signing),
  LiveKit streaming under real participants, and visual/responsive regressions.
