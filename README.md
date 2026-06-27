# ResidencyCompass

An Internal Medicine residency program ranker built for Pakistani IMG applicants. Score and tier programs from your Step 2, visa need, connections, rotations, and research — then track signals, shortlists, and interviews through match season.

**Live site:** deploy via [Vercel](https://vercel.com) from this repo.

## Features

- Personalized TARGET / LIKELY / REACH / LONG SHOT tiers
- Per-program Gold & Silver ERAS signals (3 + 12 cap)
- Connection strength scoring, shortlist, compare, interview tracker
- Community IV reports (optional Supabase backend)
- Private by default — your list stays in browser local storage

## Local development

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for Vercel + Supabase setup.

## Disclaimer

ResidencyCompass is an independent tool — not affiliated with NRMP, AAMC, AMA, or any residency program. Scores are heuristics, not predictions. Always verify program data on official sources before applying.
