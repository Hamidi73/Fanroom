# FanRoom — Launch & Handoff Checklist

What the client must own, pay for, configure, and resolve before launching publicly
and scaling up. Written for a non-developer client + their future engineer.

> TL;DR of the urgent part: **payments currently run through the developer's
> personal Stripe/Coinbase accounts.** Until the client swaps in their own, all
> money lands in the developer's bank under the developer's legal/tax identity.
> This must change before any real launch.

---

## 1. Accounts that must be transferred to the client

The site is wired to several third-party services. Some are under the developer's
personal accounts today and need to become the client's.

| Service | Role in the app | What has to happen |
|---|---|---|
| **Stripe** | Card payments for Roars/coins + creator payouts (Stripe Connect) | **Client must create their OWN Stripe account.** A Stripe account is tied to a business entity + bank account; it can't simply be "handed over." Client does KYC, then we swap in their live keys and re-point the webhook. Money currently flows to the developer. |
| **Coinbase Commerce** | Crypto payments | Same as Stripe — client's own Coinbase Commerce account, new API key + webhook secret. |
| **Vercel** | Hosting / deployment | Either transfer the project to the client's Vercel team (Vercel supports project transfer) **or** the client creates their own account and we redeploy from the repo. Env vars must be re-entered; domain re-pointed. |
| **Supabase** | Database, login/auth, realtime, the auto-close cron | Transfer the project to the client's Supabase organization (Supabase supports org transfer), or migrate to a fresh project. The client should hold the billing + service-role key. |
| **LiveKit** | The live video streaming itself | Client's own LiveKit Cloud project → new API key, secret, and WebSocket URL. |
| **Google OAuth ("Sign in with Google")** | Social login | Client's own Google Cloud project + OAuth consent screen, with the production domain in the authorized redirect URIs. |
| **Domain name** | The site's address | Client registers/owns the domain and points DNS at Vercel. |
| **GitHub repo** | The source code | Decide who owns the repo long-term (transfer or grant access). |
| **In-app admin account** | The `/admin` dashboard | Today the developer's account is the admin. Flag the client's account as admin and remove the developer's. |

---

## 2. What the client will pay for (recurring)

Prices are indicative (early-2026) — **verify current pricing with each vendor.**
The order below is roughly largest-cost-first at scale.

### 2a. LiveKit — video streaming **(the #1 cost driver)**
- Live video is billed mainly on **bandwidth/egress**: it scales with
  *(concurrent viewers) × (minutes watched) × (video quality)*. A room with one
  host and 500 viewers for 90 minutes is ~500× the data of the host alone.
- A handful of small rooms is cheap; thousands of concurrent viewers is the
  single biggest bill the client will see. **Model this before launch** using
  LiveKit's pricing calculator and realistic concurrency.
- Has a free/dev tier; production needs a paid plan. Levers to control cost:
  simulcast/adaptive quality, capping resolution, limiting room sizes.

### 2b. Supabase — database + auth + realtime
- Free tier exists but is not for production. **Pro is ~$25/mo** plus usage
  (database compute, bandwidth, storage, monthly active users, realtime
  concurrent connections). Costs rise with active users and realtime usage
  (the live score rail, chat, member counts all use realtime).

### 2c. Vercel — hosting
- **Pro is ~$20/user/mo**, plus overages on bandwidth and serverless function
  execution. Note the clip engine ships a **32 MB WebAssembly file** that the
  browser downloads the first time someone clips — that counts toward Vercel
  bandwidth (it is cached after first load).

### 2d. Payment processing fees (per transaction, not flat)
- **Stripe**: ~2.9% + $0.30 per card charge; **Stripe Connect** adds payout/
  account fees if creators withdraw earnings. Currency conversion + international
  cards cost more.
- **Coinbase Commerce**: ~1% per crypto transaction.
- These come out of revenue, but the client should understand the margins on
  Roars/coin sales and creator payouts.

### 2e. Transactional email (needed at scale)
- Login confirmation / password-reset emails currently use **Supabase's built-in
  email, which is rate-limited and not meant for production volume.** The client
  needs a real SMTP/email provider (e.g. Resend, Postmark, SendGrid, Amazon SES)
  configured in Supabase Auth. Budget a small monthly fee + per-email cost.

### 2f. Redis (for rate limiting at scale)
- The app rate-limits payments, the live feed, and wallet linking. Without a
  configured Redis (`REDIS_URL`), it falls back to **per-instance in-memory
  limits that don't work across Vercel's serverless instances** — i.e. the
  limits are far weaker in production. A managed Redis (e.g. Upstash — has a free
  tier, then usage-based) closes that gap.

### 2g. Smaller / optional
- **Domain**: ~$10–15/yr.
- **Sports data feed (recommended)**: fixtures & live scores currently come from
  *free, unofficial* public sources (OpenFootball + ESPN's undocumented
  scoreboard). These can break, rate-limit, or block traffic at scale. For a
  serious launch, budget for a **licensed sports-data API** (e.g. Sportradar,
  API-Football). See §3.
- **Error monitoring / analytics / uptime** (e.g. Sentry, Plausible) — optional
  but strongly recommended for a real launch.

---

## 3. Configuration changes for production

Engineering tasks to do once the accounts above exist. All secrets go into
**Vercel → Project → Environment Variables (Production)** — never into the code.

**Environment variables the app reads:**

| Variable | Service | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | client's project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | publishable key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | **secret** — server only, never `NEXT_PUBLIC` |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit | `wss://…` project URL |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | LiveKit | **secret** |
| `STRIPE_SECRET_KEY` | Stripe | **live** key, not test |
| `STRIPE_WEBHOOK_SECRET` | Stripe | from the production webhook endpoint |
| `COINBASE_COMMERCE_API_KEY` / `COINBASE_COMMERCE_WEBHOOK_SECRET` | Coinbase | **secret** |
| `REDIS_URL` | Redis | enables distributed rate limiting |
| `FIXTURES_URL` / `LIVE_SCORES_URL` | (optional) | override the default free score sources |

**Other production config:**
- **Stripe**: switch from test to **live** mode; create a **webhook endpoint
  pointing at the production domain** (`/api/payments/stripe/webhook`) and copy
  its signing secret; configure **Connect** (payout schedule, branding, the
  creator onboarding flow).
- **Coinbase Commerce**: create the webhook → `/api/payments/crypto/webhook`,
  copy the shared secret.
- **Supabase Auth**: set the **Site URL** and **Redirect URLs** to the production
  domain (otherwise login/OAuth redirects break), and configure a **custom SMTP
  provider** (see §2e).
- **Google OAuth**: add the production domain to authorized origins + redirect
  URIs in Google Cloud Console.
- **Auto-close cron**: a Supabase `pg_cron` job (`close_inactive_rooms`, every
  minute) deletes rooms with no activity for 5 minutes — it transfers with the
  Supabase project; just confirm `pg_cron` is enabled on the new project.
- **Admin**: set the client's profile `is_admin = true`; unset the developer's.
- **DNS / domain**: point the domain at Vercel and add it in the Vercel project.

---

## 4. Legal & compliance (do before a public launch)

This is the client's responsibility and a lawyer should review it. Notable
exposure given what the app does:

- **Terms of Service + Privacy Policy** — required, especially since the site
  takes payments and stores accounts.
- **Real money + virtual currency ("Roars")**: the coin system is intentionally
  **one-way and non-cashable** (you buy Roars, you can't withdraw them), which is
  deliberately designed to stay clear of money-transmitter and gambling law — but
  a lawyer should confirm this for the launch jurisdictions. A refund policy is
  needed.
- **Creator payouts (Stripe Connect)**: KYC of creators, tax reporting
  (e.g. 1099s in the US), and platform liability for paid content.
- **Crypto payments**: regulatory treatment varies by country — review before
  enabling in a given market.
- **Intellectual property — review carefully:**
  - **"World Cup 2026" / FIFA marks** are trademarked; using them in branding is
    a real exposure. (The app deliberately shows **no match footage** — that part
    is handled — but the naming and nation/flag usage should be reviewed.)
  - **Player sticker likenesses** (e.g. Messi, Ronaldo and other named players)
    are **name/image/likeness rights** — shipping paid stickers of real players
    without licensing is a likely infringement. Either license them or replace
    with original, non-infringing art before charging for them.
  - Gift sound effects / any third-party media should be cleared for commercial
    use.
- **Content moderation**: chat and room titles are user-generated. There's no
  profanity/abuse filter or reporting/ban flow today beyond admin room deletion —
  a real launch needs moderation tooling and a clear policy (and DMCA process).
- **Age / COPPA**: if under-13s could sign up, US COPPA (and similar laws) apply;
  decide on an age gate.
- **GDPR / CCPA**: self-serve account deletion already exists (good); add a
  cookie/consent notice and a documented data-handling policy.

---

## 5. Engineering hardening before scale

- **Rate limiting → Redis** (§2f): required for the limits to actually hold in
  production.
- **Sports data reliability** (§2g): move off the free/unofficial ESPN +
  OpenFootball feeds to a licensed API — otherwise live scores can silently
  break mid-tournament.
- **LiveKit cost controls**: cap resolution, enable simulcast/adaptive quality,
  and decide on max room sizes before opening to large audiences.
- **Monitoring & backups**: add error tracking (e.g. Sentry), uptime monitoring,
  and turn on Supabase point-in-time-recovery / backups.
- **Load testing**: simulate expected concurrent rooms/viewers against LiveKit +
  Supabase before a big launch moment.
- **Content moderation tooling** (see §4).

---

## 6. Security posture — already handled

For context, a security/QA audit was completed and all findings fixed
(see `docs/STRESS_TEST_REPORT.md`). In place today: row-level security on every
table, secrets kept server-side only, signature-verified payment webhooks,
server-authoritative pricing for coins/gifts (clients can't set amounts),
ed25519-verified wallet linking, a tightened Content-Security-Policy, and
self-serve account deletion. The remaining launch work is the ownership,
billing, configuration, and legal items above — not unresolved security bugs.
