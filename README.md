# Card Collection OS

A private, mobile-friendly tool for building a Pokemon / NHL card collecting
and flipping business: snap a photo of a card, get it identified, check real
sold/listed prices, see expected profit on a buy, and track your whole
collection as a portfolio — synced between phone and desktop.

## How it works (V1)

- **Identify**: upload a photo → Claude (vision) identifies the card (game,
  set, year, number, variant, condition notes).
- **Price check**: one-tap links to eBay *sold* listings, PriceCharting, and
  TCGplayer pre-filled with the exact card, so you read real numbers in
  seconds. There's also a field to log what the **Collectr app** shows for
  cross-referencing — Collectr has no public API, so this is a manual entry.
- **Profit calculator**: enter your acquisition cost and the observed market
  price, and it computes net profit / ROI% after estimated marketplace fees
  and shipping.
- **Portfolio**: every card you add tracks cost, status (held/sold), and
  value, with running totals for spend, estimated value, unrealized gain,
  and realized profit.

This is intentionally the **free/manual tier** to start. V2 will swap in
paid pricing APIs (PriceCharting API, eBay Browse API, TCGplayer API) for
automatic price pulls instead of tap-through links — same UI, just an
automated fetch behind the existing fields.

## Going live

See **[SETUP.md](SETUP.md)** for the exact 10-minute, paste-and-click runbook
(Supabase + Vercel) with values pre-filled.

## One-time setup (things only you can do)

The app is built (code, schema, deploy config) and ready to go — these are
just account-creation steps that need your own login/billing identity:

1. **Supabase** (free) — create a project at supabase.com, then in the SQL
   editor run `supabase/schema.sql` from this repo. Grab your Project URL
   and `anon` public key from Project Settings → API.
2. **Vercel** (free) — import this GitHub repo as a new Vercel project.
3. **Anthropic API key** — for the card identification calls.
4. Set these environment variables in the Vercel project (Settings →
   Environment Variables), then redeploy:
   - `APP_PASSCODE` — whatever passcode you want to gate the app with
   - `AUTH_SECRET` — any long random string
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

Once deployed, open the Vercel URL on your phone and desktop, log in with
your passcode, and you're syncing across both.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

## Project layout

- `public/` — the whole frontend: plain HTML/CSS/JS, no build step.
- `pages/api/` — serverless endpoints (login, config, card identification).
- `middleware.js` — passcode gate, applied to every route except `/login.html`.
- `supabase/schema.sql` — the `cards` table + storage bucket for photos.
