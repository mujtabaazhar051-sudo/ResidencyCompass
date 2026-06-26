# Deploy ResidencyCompass

## 1. Vercel (get it live)

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Add environment variables (step 2 below) before or right after first deploy.
5. Deploy. You’ll get a URL like `https://residency-compass.vercel.app`.

`vercel.json` already rewrites all routes to `index.html` for client-side routing.

### CLI (optional)

```bash
npm i -g vercel
cd IMResidencyTool
vercel
vercel --prod
```

---

## 2. Supabase (auth + community database)

### Create project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. **Project Settings → API** → copy **Project URL** and **anon public** key.

### Run database schema

1. **SQL Editor** → New query.
2. Paste contents of `supabase/schema.sql` → **Run**.

### Auth settings

1. **Authentication → Providers → Email** — enabled by default.
2. For quick testing: **Authentication → Providers → Email** → turn off **Confirm email** (optional; turn back on for production).
3. **Authentication → URL configuration** → add your Vercel URL to **Site URL** and **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `http://localhost:5173` (local dev)

### Vercel env vars

In Vercel → Project → **Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |

Redeploy after adding variables (Vite bakes `VITE_*` in at build time).

### Local dev

Copy `.env.example` to `.env.local` and fill in the same keys:

```bash
cp .env.example .env.local
npm run dev
```

---

## 3. Community submissions

Once Supabase is configured and users sign in:

- **Community Data** tab → IV reports go to `iv_reports`.
- Error / question reports go to `community_reports`.

View submissions in Supabase **Table Editor**. Review manually before updating `programs.json`.

---

## 4. Custom domain (when ready)

1. Buy domain (GoDaddy, Hostinger, Namecheap, etc.).
2. Vercel → Project → **Settings → Domains** → Add domain.
3. Add the DNS records Vercel shows at your registrar.
4. Update Supabase **Site URL** and **Redirect URLs** to the custom domain.

---

## Checklist

- [ ] GitHub repo connected to Vercel
- [ ] First deploy green
- [ ] Supabase project created
- [ ] `schema.sql` executed
- [ ] `VITE_SUPABASE_*` set in Vercel + redeployed
- [ ] Sign up / sign in works on live URL
- [ ] Test IV report submission in Community tab
- [ ] Custom domain (later)
