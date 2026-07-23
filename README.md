# ResidencyCompass

A free web app that helps Pakistani IMGs explore U.S. Internal Medicine programs more clearly. Combine program factors with each applicant’s geographic preferences and background to support thoughtful mutual fit — then track signals, shortlists, and interviews through the season.

**Live site:** deploy via [Vercel](https://vercel.com) from this repo.

## Features

- Fit tiers (TARGET / LIKELY / REACH / LONG SHOT) as a guide for exploration — not Match prediction
- Per-program Gold & Silver ERAS signals (3 + 12 cap)
- Connection strength, shortlist, compare, interview tracker
- Optional community IV reports (Supabase)
- Private by default — your list stays in browser local storage

## Local development

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for Vercel + Supabase setup.

## Disclaimer

ResidencyCompass is an independent tool — not affiliated with NRMP, AAMC, AMA, or any residency program. Scores are heuristics to support thoughtful program fit, not predictions. Always verify program data on official sources before applying.
