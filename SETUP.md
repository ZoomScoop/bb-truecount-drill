# Go Live — 10-Minute Setup

Everything in this repo is built and tested. These are the only steps left,
and they're only here because they need YOUR browser logins (account auth and
deploy can't be automated from the build environment). Do them in order.

You'll set up two free accounts: **Supabase** (database + photo storage) and
**Vercel** (hosts the app). Then the same URL works on your desktop and phone.

---

## Step 1 — Supabase (the database)  ~4 min

1. Go to **https://supabase.com** → sign in → **New project**.
   - Name it anything (e.g. `card-collection-os`). Pick any region near you.
   - Set a database password (save it somewhere; you won't need it for the app).
   - Click **Create new project** and wait ~1 min for it to provision.
2. In the left sidebar open **SQL Editor** → **New query**.
3. Open the file `supabase/schema.sql` in this repo, copy ALL of it, paste it
   into the SQL editor, and click **Run**. You should see "Success."
4. In the left sidebar open **Project Settings** (gear) → **API**. Copy these
   two values — you'll paste them into Vercel in Step 2:
   - **Project URL**  (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key  (a long `eyJ...` string)

---

## Step 2 — Vercel (host + go live)  ~5 min

1. Go to **https://vercel.com** → sign in **with GitHub** (so it can see your repo).
2. Click **Add New… → Project**. Find **bb-truecount-drill** in the list and
   click **Import**. (Leave all build settings on default — it auto-detects Next.js.)
3. Before clicking Deploy, expand **Environment Variables** and add these five
   (Name → Value):

   | Name | Value |
   |------|-------|
   | `APP_PASSCODE` | *pick any passcode you'll remember* |
   | `AUTH_SECRET` | `fvfIUohACrgFUot8Blb4nT_8REdSAWgJMFni_E3PxUpTTylr-5NMJs5r-h094et2` |
   | `ANTHROPIC_API_KEY` | *your Anthropic API key (console.anthropic.com → API Keys)* |
   | `SUPABASE_URL` | *the Project URL from Step 1* |
   | `SUPABASE_ANON_KEY` | *the anon public key from Step 1* |

   (The `AUTH_SECRET` above was randomly generated for you — just paste it as-is.)
4. Click **Deploy**. Wait ~1–2 min. Vercel gives you a URL like
   `https://bb-truecount-drill.vercel.app`.

---

## Step 3 — Use it  ~1 min

- Open that Vercel URL on your **desktop** → enter your `APP_PASSCODE` → you're in.
- Open the same URL on your **phone**, log in, then tap the browser's
  **Share → Add to Home Screen** so it behaves like an app.
- Anything you add on one device shows up on the other (it's the same database).

## Step 4 — Make the repo private (optional but recommended)

Your GitHub tab is already on the repo. Go to **Settings → General →** scroll to
**Danger Zone → Change repository visibility → Private**. Vercel keeps deploying
fine from a private repo.

---

### If a card photo won't identify
That means `ANTHROPIC_API_KEY` is missing or wrong in Vercel. Fix it under
Vercel → your project → **Settings → Environment Variables**, then
**Deployments → … → Redeploy**.

### Later (V2)
When you want automatic price pulls instead of tap-through links, we add a
PriceCharting / eBay / TCGplayer API key the same way (one more env var) — no
rebuild of the app needed.
