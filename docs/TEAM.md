# ResidencyCompass — Volunteer Team

Last updated: 2026-08-02 (Aieman applying; Waqas lead pending)

**Model:** Volunteers fill **secondary sheets**. **Master sheet** = Mujtaba + Mohammad Ahmed only. Website publish = Mujtaba only.

**Product framing:** Explore U.S. IM programs for clearer mutual fit — not to game the Match.

**Disclaimer (say this often):** ResidencyCompass is an independent project — **not affiliated with, endorsed by, or authorized by AAMC, NRMP, AMA, ECFMG, or any residency program.**

---

## Role split (post–kickoff meeting)

### Social / outreach

| Name | School | Applying? | Focus |
|------|--------|-----------|--------|
| **Zoya Tariq** | Shalamar Medical and Dental College | No | Social + outreach (primary continuity) |
| **Usama Idrees** | KMSMC Sialkot | No | Social + outreach (primary continuity) |
| **Aieman Naeem** | Rawalpindi Medical University | **Yes** | Social support (lighter load during Match season) |

**Jobs**
- Run Insta, Facebook, LinkedIn (LinkedIn page already exists — give **admin** to whoever is already active on LinkedIn among Zoya / Usama / Aieman)
- Reach med influencers / peer accounts → ask them to try the site + share a story/post
- Mujtaba provides **post images / captions**; they schedule and engage
- They should **also see** how data is collected and merged (watch 1–2 merge sessions) so outreach stays accurate
- Continuity when Match gets busy: **Zoya + Usama**

### Data (secondary sheets → master)

| Name | School | Applying? | Focus |
|------|--------|-----------|--------|
| **Mohammad Ahmed** | DIMC | No (2025) | **Ops + master co-owner** with Mujtaba. Dedup. Merge secondary → master. |
| **Waqas Ali** | Ameer-ud-Din Medical College | Yes | Strong contributor (~200+ list). **Data lead asked privately — awaiting reply. Do not announce in group until he accepts.** |
| **Hasan Raza** | DIMC | Yes | Secondary sheet / uni + peer sources |
| **Naima Agha** | Foundation University Medical College | Yes | Secondary sheet / uni + peer sources |
| **Aimal** | Foundation University Medical College | Yes | Secondary sheet / uni + peer sources |

**Near-term data source:** MedAngle mentee responses (~200 applicants, mostly IM) — matched program + programs interviewed at.  
**Do first:** add/update programs, comments/outcomes, visa, contacts, Pak pathway flags, etc.  
**Median Step 2:** optional later — only from **RC / MedAngle-derived scores**, not copied from ResMatch or Residency Explorer (see formula below).

---

## Data pipeline

```
MedAngle sheet / uni lists / peer sources / Waqas’s list
        ↓
Secondary Google sheets (data volunteers)
        ↓
Dedup check (Ahmed + Mujtaba)
  → program already on master/site → update comments / fields / median only
  → new program → full new row
        ↓
Master sheet (Mujtaba + Ahmed only)
        ↓
Website (Mujtaba only)
```

---

## Median Step 2 formula (when you teach it)

**Goal:** RC’s own estimate from applicant scores who got an IV or matched at that program — **not** a copy of ResMatch/RE.

### Google Sheets (per program)

1. Collect Step 2 scores of MedAngle (or RC) applicants who **matched or got an IV** at Program X.  
2. Put scores in a column, e.g. `B2:B20`.  
3. Formula:

```text
=IF(COUNT(B2:B20)<3, "", ROUND(MEDIAN(B2:B20)))
```

- **Median** = middle value when sorted (not the average).  
- **Require n ≥ 3** before publishing a median (empty if fewer).  
- Optional note in Comments: `RC median Step 2: 245 (n=5, MedAngle/IV+match)`.  
- **Never** paste ResMatch/RE medians into the Median column as if they were yours. If you cite ResMatch, keep it only as a labeled anecdotal note in Comments.

### Quick example
Scores: 238, 245, 245, 250, 252 → median = **245**

---

## Work rules

1. Master sheet = Mujtaba + Ahmed only.  
2. Everyone else writes to **secondary** sheets.  
3. Flag possible duplicates — don’t create a second row for the same NRMP code.  
4. Prefer program website > rumor. Unsure → `NOT SURE` + link.  
5. No personal applicant names in public/comment fields.  
6. Always state: **not affiliated with AAMC / NRMP / AMA / ECFMG.**

---

## Social media notes

- LinkedIn page exists → admin to the person already active on LinkedIn among Aieman / Zoya / Usama  
- Provide a small folder of approved images + 5–10 caption templates  
- Every post should include site link + independent-tool disclaimer (short)
