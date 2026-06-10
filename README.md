# FanRoom Global

A World Cup 2026 fan-room platform — fans create an account, host or join
creator-led watch-along rooms, and chat in real time. **Reactions, commentary
and community only — never match footage.**

Wired to **real data and a real backend**:

- **Fixtures are real** — the complete 104-match 2026 schedule, fetched at
  request time from OpenFootball (public-domain data), not hardcoded. Knockout
  matches whose teams aren't decided yet show placeholder slots (e.g. "W101").
- **Nations are real reference data** (the participating teams).
- **Accounts, rooms and chat are real** — backed by Supabase (Postgres auth +
  database + realtime). Users sign up, create rooms, join them, and chat live.
  Everything is empty until real people use it (no fake seed content).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

Requires `.env.local` (already present locally, gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
# Live video (LiveKit) — secret stays server-side, URL is public
NEXT_PUBLIC_LIVEKIT_URL=wss://<project>.livekit.cloud
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
```

> **Sign-ups are instant:** a database trigger auto-confirms new accounts, so no
> email confirmation step is needed (and no confirmation emails are sent). To
> require real email confirmation instead, drop the `auto_confirm_email` trigger
> and turn on "Confirm email" in the Supabase dashboard.

> Note: this project pins **Next.js 16** (App Router) + React 19 + Tailwind v4.
> Some APIs differ from older Next.js — see `AGENTS.md`.

## How the project is organised

```
src/
  app/
    data/            ← static/reference data + the live fixtures API
      fixtures.ts      LIVE fixtures from OpenFootball. Async getters.
      nations.ts       real reference data (name/flag/languages)
      i18n.ts          homepage UI translations (5 languages)
      index.ts         barrel — import from "@/app/data"

    components/      ← reusable UI (cards, headers, chat, forms, GoogleButton)
    page.tsx           Homepage (server: fixtures) + HomeClient.tsx (shell)
    nation/[slug]/     Per-nation hub page
    signup/  login/    Auth pages (email + password, and Continue with Google)
    auth/callback/     OAuth callback — exchanges the Google code for a session
    profile/           Signed-in user's account page (edit name, password, rooms)
    rooms/             Rooms list
    rooms/new/         Create-a-room form (requires login)
    rooms/[id]/        A room: Twitch-style stage (video + side chat), join/leave,
                       realtime chat, host-only live video (non-members get a
                       muted preview; joining unlocks audio + chat)
    api/livekit/token  Mints LiveKit tokens (host=publish, members=watch)
    admin/             Admin-only (login-gated). page.tsx = LIVE stats dashboard
    admin/manage/      Delete accounts; close/delete any room

  lib/
    supabase/client.ts   browser Supabase client
    supabase/server.ts   server Supabase client (cookies)
    types.ts             DB row shapes
  middleware.ts          refreshes the auth session each request
```

### Database (Supabase)

Four tables with row-level security:

| Table          | What it holds                                  |
| -------------- | ---------------------------------------------- |
| `profiles`     | one row per user (public display name); auto-created on signup |
| `rooms`        | a room hosted by a user                        |
| `room_members` | who joined which room                          |
| `messages`     | chat messages (only room members can post)     |

`profiles` also has an `is_admin` flag (locked down — users can't set it). RLS
enforces: anyone can read; only authenticated users create rooms / join / post;
you can only add or remove **yourself**; only a room's members can post; a room's
**host** (or an **admin**) can close/delete it. Chat updates over Supabase
Realtime. Admin-only RPCs (`admin_list_users`, `admin_delete_user`) power the
admin panel.

**Make someone an admin:** set their flag in SQL —
`update public.profiles set is_admin = true where id = '<user-uuid>';`
Admins see an **Admin** link in the header and a shortcut button on their profile.

### Profile / account page (`/profile`)

Every signed-in user has a profile page (linked from their name in the header):
edit display name (synced to both the `profiles` row and auth metadata), change
password (hidden for Google accounts), and see the rooms they host and have joined.

### Admin dashboard (`/admin`)

The admin home is a **live dashboard** — member / room / message / join counts and
the newest members & rooms, all read from the database on each load (nothing is
hardcoded). `/admin/manage` is the moderation panel (delete accounts; close,
reopen, or delete any room).

### Sign in with Google (free)

Code is wired up (the **Continue with Google** button + `/auth/callback`). To turn
it on you only need free dashboard config — no cost:

1. **Google Cloud Console** → APIs & Services → Credentials → *Create OAuth client
   ID* (type: Web application). Under **Authorized redirect URIs** add:
   `https://fnfxchmdneffqxvrifwt.supabase.co/auth/v1/callback`
   (Configure the OAuth consent screen first if prompted; "External" is fine.)
2. Copy the **Client ID** and **Client secret**.
3. **Supabase dashboard** → Authentication → Providers → **Google** → enable, paste
   the Client ID + secret, save.
4. **Supabase** → Authentication → URL Configuration → add your app origins to
   **Redirect URLs** (e.g. `http://localhost:3000/**`, and later your live domain
   `https://yourdomain/**`).

That's it — the Google button then works on both `/login` and `/signup`. New Google
users get a profile auto-created (their Google name becomes the display name).

### Live video (LiveKit)

Each room has host-only video: the host broadcasts their camera, members watch
with sound. Everyone else — including logged-out visitors — sees a **muted
preview** of the stream (the Twitch pattern: watch freely, join to unlock audio
and chat). `/api/livekit/token` checks (via Supabase) whether the requester is
the host (publish) or a member (watch+audio) and mints a scoped LiveKit token;
anonymous preview tokens are subscribe-only and rate-limited. The API secret
never reaches the browser.

### Paid highlighted messages (Stripe + crypto)

Members can pay a preset tier (Spotlight $2 / Featured $5 / Headliner $10) to
post a **highlighted** chat message — Twitch Hype-Chat style. Flow:

1. The pay button calls `/api/payments/{stripe|crypto}/checkout`, which validates
   the user is a member of an open room, records a **pending** row in `donations`,
   and starts a hosted checkout (Stripe Checkout or a Coinbase Commerce charge).
   **The amount comes only from the server-side tier list (`src/lib/tiers.ts`)** —
   the client sends a tier id, never a price.
2. On payment, the provider calls the matching **webhook**
   (`/api/payments/{stripe|crypto}/webhook`), which verifies the signature and
   calls `fulfillDonation()` — this posts the message with `highlight = true`
   using the **service role** (idempotent, so duplicate webhooks are safe).
3. RLS forbids normal members from setting `highlight` themselves
   (`Members can post messages` requires `highlight = false`), so highlights can
   *only* be created by a verified payment.

#### Creator payouts (Stripe Connect)

Donations are split: the platform keeps a fee (default **20%**, see
`PLATFORM_FEE_BPS` in `src/lib/connect.ts`) and the rest goes to the **host of
that room** — never anyone else. Mechanism:

- Each host connects a Stripe **Express** account once via Stripe-hosted
  onboarding (`/api/payments/connect/start` → `…/return`), surfaced as a
  **Creator payouts** card on `/profile`. Their `stripe_account_id` +
  `stripe_payouts_enabled` live on `profiles` (service-role only).
- When the host is connected, the Stripe checkout is a **destination charge**:
  `application_fee_amount` (the platform cut) stays with the platform, and
  `transfer_data.destination` routes the remainder to the host's account.
- **Highlights work in every room.** If the host hasn't connected payouts yet,
  the charge simply stays on the platform (no transfer); the split kicks in
  automatically once that host connects. "Connected" means the account's
  **transfers capability is active** — full bank/payout KYC (needed only to cash
  out) is a separate step, so hosts can start receiving into their balance first.
- **Enable Connect once** in the Stripe dashboard (Connect → Get started; free)
  or account creation will fail. Crypto can't auto-split, so it stays disabled.

#### Gift economy ("Roars")

Rooms also have a TikTok/Bigo-style gift layer: a floating 🎁 drawer of ~70 gifts
(reactions, banter, trash-talk, and 48 nation "legend" gifts), realtime fly-over
animations with combos and full-screen "takeovers", and synthesized sound — see
`src/lib/gifts.ts` (catalog, server-authoritative prices), `giftSound.ts`,
`GiftDrawer.tsx`, and `RoomGiftsProvider.tsx`.

There are also **meme sticker packs** (WhatsApp/Instagram-style): real meme
images — classic templates plus football-meme editions — sourced from the
memegen.link template library and committed under `public/stickers/` (no
third-party CDN at runtime). Catalog + server-authoritative prices live in
`src/lib/stickers.ts`. A sent sticker flies over the stream AND is persisted
as a real chat message (`[sticker:<id>]`, rendered as the image inline), so it
stays in the room's history; gift sends likewise leave a `[gift:<id>:<n>]`
chat line.

The currency is **Roars** (100 ≈ $1, one-way / non-cashable):

- **Buying is real** — the coin store starts a Stripe Checkout (server-priced
  from `COIN_BUNDLES`); the webhook credits the `wallets` table via the
  idempotent `credit_coins` RPC. New wallets get 500 welcome Roars.
- **Sending a gift or sticker** debits the wallet atomically via `spend_roars`
  (optimistic UI, reconciled). Gift overlay broadcasts themselves are ephemeral
  (no DB write); sticker/gift chat lines are normal `messages` rows.
- Coin purchases are captured to the platform; paying out a creator's gift share
  would reuse the same Connect transfer path as highlights (future work).

Turn it on by setting the env vars below. Without them, the feature stays hidden
and the rest of the app is unaffected.

```
SUPABASE_SERVICE_ROLE_KEY=          # Supabase → Project Settings → API
STRIPE_SECRET_KEY=sk_test_...       # Stripe → Developers → API keys (test mode)
STRIPE_WEBHOOK_SECRET=whsec_...     # Stripe → Developers → Webhooks → your endpoint
COINBASE_COMMERCE_API_KEY=          # Coinbase Commerce → Settings → API keys
COINBASE_COMMERCE_WEBHOOK_SECRET=   # Coinbase Commerce → Settings → Webhook subscriptions
```

- **Stripe webhook endpoint:** `https://<your-domain>/api/payments/stripe/webhook`,
  event `checkout.session.completed`.
- **Coinbase webhook endpoint:** `https://<your-domain>/api/payments/crypto/webhook`,
  event `charge:confirmed`.
- Test cards: use `4242 4242 4242 4242` (any future date / CVC) in Stripe test mode.

### Redis (rate limiting / caching)

Set `REDIS_URL` to enable real, distributed rate limiting (preview-token + payment
checkout endpoints). Any standard Redis works through this one variable — Upstash
(`rediss://…`), DigitalOcean Managed Redis, or a droplet. Unset = best-effort
in-memory limiting (per serverless instance). See `src/lib/redis.ts`.

### Handing the backend to DigitalOcean

The backend is built to be swappable by env var (Redis, LiveKit, Supabase). See
**[MIGRATION.md](MIGRATION.md)** for the full DO handoff playbook.

### Config (optional env vars)

```
FIXTURES_URL=https://.../worldcup.json   # swap the fixtures source
```

## Common tasks (where to edit)

| I want to…                            | Edit…                                       |
| ------------------------------------- | ------------------------------------------- |
| Change the fixtures source            | `src/app/data/fixtures.ts` (+ `FIXTURES_URL`) |
| Add / change a nation                 | `src/app/data/nations.ts`                   |
| Change the DB schema / RLS            | Supabase (migrations) + `src/lib/types.ts`  |
| Change brand colours or fonts         | `src/app/globals.css` (theme tokens)        |
| Restyle a card without touching data  | the matching file in `src/app/components/`  |

## No match footage

By design, no page ever shows or embeds the match feed — rooms are for reactions,
commentary and community only.
