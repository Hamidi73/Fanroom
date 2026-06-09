# Migration / Handoff Playbook — moving the backend to DigitalOcean

This app is deliberately built so the backend pieces are **swappable via environment
variables** — no code changes needed to move providers. This document is for whoever
takes the site over and wants to run it on DigitalOcean (Postgres + Redis + droplet).

## TL;DR — what's swappable and how

| Piece | Demo (now) | Move to DigitalOcean by… | Code change? |
| ----- | ---------- | ------------------------ | ------------ |
| **Redis** | in-memory fallback (or Upstash) | set `REDIS_URL` to DO Managed Redis / droplet Redis | **None** |
| **Live video** | LiveKit Cloud | self-host LiveKit on a droplet, set `NEXT_PUBLIC_LIVEKIT_URL` + `LIVEKIT_API_KEY/SECRET` | **None** |
| **Database + auth + realtime** | Supabase (managed) | self-host the Supabase stack on DO (Docker), point it at DO Managed Postgres | **None** (env only) — *if done the recommended way* |
| **App hosting** | Vercel | run Next.js on a droplet behind nginx, or keep Vercel | None (ops only) |

The whole strategy: **keep the same application code; change only env vars + where the
services run.**

---

## 1. Redis → DigitalOcean (easiest)

The app already uses a single `REDIS_URL` (see `src/lib/redis.ts`). It powers
distributed rate limiting (`src/lib/rateLimit.ts`) and is ready for caching.

1. Create a **DO Managed Redis** database (or run `redis-server` on a droplet).
2. Copy its connection string (`rediss://default:<pw>@<host>:<port>`).
3. Set `REDIS_URL` in the host's environment and redeploy/restart.

That's it. With no `REDIS_URL`, the limiter falls back to per-instance in-memory
(fine for a demo, not a hard global limit).

## 2. Live video → self-hosted LiveKit (removes LiveKit Cloud bandwidth cost)

LiveKit is open source. Self-hosting it on a droplet eliminates the per-minute Cloud
bandwidth cost.

1. Provision a droplet (LiveKit recommends a CPU-optimized box) + a subdomain
   (e.g. `live.yourdomain.com`) with TLS.
2. Deploy LiveKit (their Docker image / `livekit-server` + a TURN server). Generate an
   API key/secret pair.
3. Update env: `NEXT_PUBLIC_LIVEKIT_URL=wss://live.yourdomain.com`,
   `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.

No app code changes — the token route (`src/app/api/livekit/token/route.ts`) and the
client components read these env vars.

## 3. Database / auth / realtime → DigitalOcean

**Important:** Supabase is not "just Postgres." It bundles **Auth** (login, Google
OAuth, sessions, `auth.users`, `auth.uid()`), **Realtime** (live chat + leaderboard),
**Row-Level Security**, and SQL functions. The app depends on all of it.

### ✅ Recommended: self-host the Supabase stack on DO
This preserves **100% of the code, RLS, auth, and realtime** — you only change env vars.

1. Spin up a droplet and deploy **self-hosted Supabase** (their official Docker Compose:
   Postgres + GoTrue auth + Realtime + PostgREST + Storage + Kong gateway). You can
   point it at **DO Managed Postgres** instead of the bundled Postgres if you prefer a
   managed DB.
2. Migrate the data:
   ```bash
   # from the current Supabase project (Settings → Database → connection string)
   pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges -Fc -f fanroom.dump
   pg_restore --no-owner --no-privileges -d "$DO_SUPABASE_DB_URL" fanroom.dump
   ```
   This carries every table, RLS policy, trigger, and function.
3. Recreate the auth users (export via the Supabase dashboard / Admin API) and re-enable
   the `auto_confirm_email` + `handle_new_user` triggers (they come across in the dump).
4. Re-enable Realtime on `messages`, `room_members`, `rooms` (publication
   `supabase_realtime`) — already in the schema; confirm after restore.
5. Set env to the self-hosted instance:
   `NEXT_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (from the self-hosted
   stack's generated keys).
6. Reconfigure Google OAuth redirect + Site URL in the self-hosted Auth settings.

### ❌ Not recommended: bare Postgres + custom auth
Replacing Supabase with only DO Managed Postgres means **rebuilding from scratch**:
authentication (login/OAuth/sessions/JWT), the realtime layer for chat + leaderboard,
and RLS enforcement. This throws away working, security-reviewed infrastructure and
re-introduces risk. Only do this with a strong, specific reason.

## 4. App hosting → droplet (optional)
To move off Vercel: build (`npm run build`) and run (`npm run start`) on a droplet under
a process manager (PM2/systemd) behind nginx with TLS. Set **all** env vars from
`.env.local` on the server. You lose Vercel's auto-deploy-on-push (wire up a CI step or
deploy hook instead). Keeping Vercel is perfectly fine and simpler.

## Migration checklist
- [ ] DO Managed Redis created → `REDIS_URL` set
- [ ] LiveKit self-hosted (or keep Cloud) → `NEXT_PUBLIC_LIVEKIT_URL` + keys set
- [ ] Supabase self-hosted on DO (Docker) → data restored via `pg_dump`/`pg_restore`
- [ ] Auth users migrated; `handle_new_user` / `auto_confirm_email` triggers active
- [ ] Realtime publication confirmed on `messages`, `room_members`, `rooms`
- [ ] Google OAuth redirect + Site URL reconfigured
- [ ] All env vars set on the new host; payment webhook URLs re-pointed
- [ ] Smoke test: signup/login, create/join room, chat, live video, leaderboard, admin
