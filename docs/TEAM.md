# ResidencyCompass — Volunteer Team

Last updated: 2026-08-12 (Hasan removed; Aieman → data; CV-friendly public titles)

**Model:** Volunteers fill **secondary sheets**. **Master sheet** = Mujtaba + Mohammud Wajeeh Ahmud only. Website publish = Mujtaba only.

**Product framing:** Explore U.S. IM programs for clearer mutual fit — not to game the Match.

**Disclaimer (say this often):** ResidencyCompass is an independent project — **not affiliated with, endorsed by, or authorized by AAMC, NRMP, AMA, ECFMG, or any residency program.**

---

## Public roles (website + social)

| Name | School | Public role |
|------|--------|-------------|
| **Mujtaba Azhar** | DIMC | Founder & Product Lead |
| **Mohammud Wajeeh Ahmud** | DIMC | Co-founder & Operations Lead |
| **Waqas Ali** | Ameer-ud-Din Medical College | Head of Program Data |
| **Naima Agha** | Foundation University Medical College | Program Research Analyst |
| **Aimal Waqas** | Foundation University Medical College | Match Insights Analyst |
| **Aieman Naeem** | Rawalpindi Medical University | Program Data Specialist |
| **Zoya Tariq** | Shalamar Medical and Dental College | Community Growth Lead |
| **Usama Idrees** | KMSMC Sialkot | Digital Outreach Lead |

**Photos for About → Team:** drop into `public/team/` as `{id}.jpg` (see `src/constants/team.js` ids).

---

## Internal role split

### Leadership / master

| Name | Focus |
|------|--------|
| **Mujtaba Azhar** | Founder & Product Lead. Product + website publish. |
| **Mohammud Wajeeh Ahmud** | Co-founder & Operations Lead. Ops + master co-owner. Dedup. Merge secondary → master. |

### Data (secondary sheets → master)

| Name | Applying? | Focus |
|------|-----------|--------|
| **Waqas Ali** | Yes | **Head of Program Data.** Secondary lists, pipeline coordination. |
| **Naima Agha** | Yes | Secondary sheet / uni + peer sources |
| **Aimal Waqas** | Yes | Secondary sheet / uni + peer sources |
| **Aieman Naeem** | **Yes** | Secondary sheet / uni + peer sources |

**Near-term data source:** MedAngle mentee responses (~200 applicants, mostly IM) — matched program + programs interviewed at.  
**Do first:** add/update programs, comments/outcomes, visa, contacts, Pak pathway flags, etc.  
**Median Step 2:** optional later — only from **RC / MedAngle-derived scores**, not copied from ResMatch or Residency Explorer (see formula below).

### Social / outreach

| Name | Applying? | Focus |
|------|-----------|--------|
| **Zoya Tariq** | No | Community Growth Lead (primary continuity) |
| **Usama Idrees** | No | Digital Outreach Lead (primary continuity) |

**Jobs**
- Run Insta, Facebook, LinkedIn (LinkedIn page already exists — give **admin** to whoever is already active on LinkedIn among Zoya / Usama)
- Reach med influencers / peer accounts → ask them to try the site + share a story/post
- Mujtaba provides **post images / captions**; they schedule and engage
- They should **also see** how data is collected and merged (watch 1–2 merge sessions) so outreach stays accurate
- Continuity when Match gets busy: **Zoya + Usama**

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
6. Always state: **not affiliated with AAMC / NRMP / AMA / ECFMG**.

---

## Social media notes

- LinkedIn page exists → admin to the person already active on LinkedIn among Zoya / Usama  
- Provide a small folder of approved images + 5–10 caption templates  
- Every post should include site link + independent-tool disclaimer (short)
