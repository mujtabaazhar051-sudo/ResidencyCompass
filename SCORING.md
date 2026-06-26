# Scoring Methodology

This document explains how the IM Residency Tool scores and ranks Internal Medicine programs for Pakistani IMG applicants. All scoring runs entirely in your browser — nothing is sent to a server.

---

## Overview

Each program receives a **score from 0 to 100** and is placed into one of four tiers:

| Tier | Score threshold |
|------|----------------|
| **TARGET** | ≥ 65 (or connection override — see below) |
| **LIKELY** | ≥ 38 |
| **REACH** | ≥ 20 |
| **LONG SHOT** | < 20 |

Weights are calibrated so that a strong, well-matched Pakistani IMG applicant without personal connections scores in the 55–65 range (LIKELY), and adding a meaningful connection pushes a program to TARGET. The absolute theoretical maximum is around 95–97; the 0–100 clamp exists as a safety net and should rarely fire in practice.

---

## Step 1 — Hard Filter (Visa)

Before scoring, programs that are incompatible with your visa need are removed entirely:

| Your selection | Programs kept |
|----------------|---------------|
| J-1 Visa | Programs offering J-1 |
| H-1B Visa | Programs offering H-1B |
| J-1 or H-1B (either) | Programs offering at least one |
| **No visa needed** (US citizen / PR / EAD) | **All programs** (including those that don't sponsor visas) |

---

## Step 2 — Score Components

The raw score is the sum of all components below, then clamped to 0–100.

---

### 1. Step 2 CK Fit (max +27 pts)

Your Step 2 CK score is compared against the program's `median_step2` and any scores extracted from crowdsourced outcomes.

| Situation | Points |
|-----------|--------|
| Well above program average (+8 or more) | +27 |
| Above stated cutoff / above average | +23 |
| On par with program average (within ±8) | +14 |
| Below program average | +2 |
| No program score data available | +10 |
| Step 2 not entered | +10 (no data) |

Step 2 is the heaviest single academic factor — a 15+ point difference between two scores should shift a program by at least one tier.

---

### 2. Dow / Pak Match History (max +22 pts)

Scores differ based on whether you attended Dow University of Health Sciences (DUHS/DMC) or another Pakistani medical school.

**Dow graduate:**

| Program history | Points |
|-----------------|--------|
| Both Dow and Pakistani matched | +22 |
| Dow graduates matched | +16 |
| Pakistani graduates matched (not Dow-specific) | +10 |
| Uncertain / not sure | +2 |
| No match history | 0 |

**Other Pakistani medical school:**

| Program history | Points |
|-----------------|--------|
| Pakistani graduates matched | +10 |
| Only Dow graduates matched | +4 |
| Uncertain / not sure | +2 |
| No match history | 0 |

---

### 3. Personal Connections (max +28 pts — and tier override)

Connection strength and count are set per program on each program card.

| Strength | Base points |
|----------|-------------|
| Strong (direct mentor, PD, close faculty) | +28 |
| Moderate (met them, exchanged emails) | +16 |
| Weak (peripheral / second-degree) | +7 |

**Count bonus** (added on top of strength base):

| Contacts | Bonus |
|----------|-------|
| 2 contacts | +4 |
| 3+ contacts | +6 |

**Tier override:** If connection score ≥ 26 (i.e., any Strong connection, or two or more Moderate contacts), the program is automatically assigned **TARGET** tier regardless of total score.

---

### 4. No-Visa Bonus (flat +12 pts)

Applicants who do not need visa sponsorship (US citizens, green card holders, EAD) receive a flat +12 across every program. This also unlocks programs that otherwise wouldn't sponsor visas.

---

### 5. US Clinical Rotations (max +12 pts)

Based on the total months of US clinical rotations entered in your profile.

| Total months | Points |
|--------------|--------|
| 6+ months | +7 |
| 3–5 months | +5 |
| 1–2 months | +3 |
| None | 0 |

**Additional bonuses:**
- **State match** — rotation done in the same state as a program: +2
- **Program match** — rotation done at this specific listed program: +10 (replaces state match)

---

### 6. Research (max +13 pts, scaled by program type)

Base research points are multiplied by a program-type factor:

| Program type | Research multiplier |
|--------------|---------------------|
| University | ×1.0 (full) |
| Affiliated / teaching | ×0.6 |
| Community | ×0.3 |

| Research level | Base points (before multiplier) |
|----------------|--------------------------------|
| 2+ publications — high-impact journal | 13 |
| 1 publication — high-impact journal | 9 |
| Multiple publications — any journal | 6 |
| 1 publication — any journal | 4 |
| Presentations / abstracts only | 2 |
| No research | 0 |

*Example: 2+ high-impact publications at a community program = 13 × 0.3 = 4 pts. Same publications at a university program = 13 pts.*

---

### 7. Program Type (max +8 pts)

Community programs are most accessible for IMGs; university programs are most competitive.

| Type | Points |
|------|--------|
| Community | +8 |
| Affiliated / teaching hospital | +6 |
| University | +2 |

---

### 8. ECFMG Certification (−10 to +4 pts)

ECFMG certification is required for ERAS submission as an IMG. Programs can technically see uncertified applications but the vast majority will not consider them.

| Status | Points |
|--------|--------|
| Certified | +4 |
| Certification in progress | −3 |
| Not yet started | −10 |

---

### 9. Year of Graduation Gap (−20 to 0 pts)

Applied flat to every program based on years elapsed since medical school graduation.

| Years since graduation | Penalty |
|------------------------|---------|
| 0–3 years | 0 |
| 4–5 years | −8 |
| 6–8 years | −15 |
| 9+ years | −20 |

---

### 10. Per-Program Signal (max +8 pts)

Based on the program's signal policy and whether you have allocated a Gold or Silver signal to this program.

| Policy → Signal | Gold | Silver | No signal |
|-----------------|------|--------|-----------|
| Signals required | +8 | +5 | 0 |
| Signals help | +6 | +4 | +3 |
| Neutral | +5 | +5 | +5 |

You have a budget of **15 total signals** (Gold + Silver combined). Gold and Silver each count as 1 toward the 15.

---

### 11. Per-Program Penalty Flags (−14 to 0 pts)

Negative adjustments when specific phrases are found in a program's notes:

| Flag | Penalty |
|------|---------|
| YOG restriction mentioned | −10 |
| Marked very competitive | −5 |
| No IMG / not IMG-friendly | −14 |
| Filled via SOAP | −4 |

Total per-program penalty is capped at −14.

---

### 12. USMLE Step 3 (bonus +4 pts)

A small bonus if Step 3 has been passed. No penalty for not having it.

---

## Tier Assignment

1. **Connection override** — If the connection score for a program is ≥ 26, that program is assigned **TARGET** regardless of its total numeric score.
2. **Score-based tiers** — For all other programs:

| Score | Tier |
|-------|------|
| ≥ 65 | TARGET |
| ≥ 38 | LIKELY |
| ≥ 20 | REACH |
| < 20 | LONG SHOT |

---

## Stable Sorting

The program list only re-sorts when you explicitly click **Apply & Re-rank** or the **Re-rank ↕** banner. This prevents cards from jumping around as you adjust signals, connections, or statuses mid-session. Scores and tier badges update live; order updates on demand.

---

## Application Status Tracking

You can mark each program with one of:
- **Applied** — You have submitted your application
- **II Received** — You have received an interview invite
- **Declined** — The program declined to interview you
- **Waitlisted** — You are on a waitlist
- **🎉 Matched** — You matched at this program

Statuses are saved in your browser's local storage and are never sent anywhere.

---

## Data Freshness

Programs with a `last_verified` date more than two years ago show a ⚠ warning icon. Stale data does not affect scoring — it is a visual reminder to verify information before applying.

---

## Limitations

- Scoring reflects heuristics tuned for Pakistani IMG applicants applying to Internal Medicine. It is **not** a prediction or guarantee of interview invites or match outcomes.
- Crowdsourced outcome data may be incomplete, outdated, or inaccurate — always verify with official sources (FREIDA, NRMP, program websites).
- Median Step 2 data is sourced from ResidencyMatch.net and may not reflect the current cycle.
- Adding or editing programs requires only modifying `src/data/programs.json` — no code changes needed.

---

## Tuning the Weights

All scoring constants are named exports at the top of `src/scoring/engine.js`. The scoring engine is a pure function with no React dependencies and can be tested in isolation. Adjust constants there and click **Apply & Re-rank** to see the effect immediately.
