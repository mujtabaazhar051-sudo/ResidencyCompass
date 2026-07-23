/** Official sources users may consult — we are not affiliated with any of them and do not republish their data. */
export const OFFICIAL_SOURCES = [
  {
    id: 'nrmp',
    name: 'NRMP',
    fullName: 'National Resident Matching Program',
    url: 'https://www.nrmp.org/',
    usage:
      'Match statistics and official program identifiers. We do not republish NRMP datasets.',
  },
  {
    id: 'residency_explorer',
    name: 'Residency Explorer',
    fullName: 'AAMC Residency Explorer™',
    url: 'https://residencyexplorer.org/',
    linkLabel: 'Open Residency Explorer (your AAMC account)',
    includedInApp: false,
    usage:
      'Use on AAMC’s site for your own application research. ResidencyCompass does not copy, scrape, export, or redistribute Residency Explorer material.',
    restrictions: [
      'AAMC grants a limited personal privilege to access Residency Explorer on their site only.',
      'Copying, downloading, scraping, or using Residency Explorer material to build or supplement another database or product is prohibited.',
      'Redistributing or publishing Residency Explorer material to third parties is prohibited without written AAMC authorization.',
    ],
  },
  {
    id: 'residencymatch',
    name: 'ResidencyMatch.net',
    fullName: 'ResidencyMatch.net (crowdsourced)',
    url: 'https://residencymatch.net/',
    usage:
      'Crowdsourced median Step 2 and interview-invite reports. May be incomplete or outdated — treat as anecdotal.',
  },
  {
    id: 'community',
    name: 'Community reports',
    fullName: 'Applicant & IMG community reports',
    url: null,
    usage:
      'Match outcomes, Pakistani graduate pathway notes, and signal policies submitted or curated by applicants. Not independently verified.',
  },
]

/** Which fields in programs.json typically draw from which sources. */
export const PROGRAM_FIELD_SOURCES = [
  { fields: 'Program code & name', sources: ['NRMP identifiers', 'Manual curation'], note: 'Cross-check on each program website before applying.' },
  { fields: 'Visa type, PGY positions, PD contact', sources: ['Program website', 'Community reports'], note: 'Changes each cycle — verify directly.' },
  { fields: 'Median Step 2', sources: ['ResidencyMatch.net'], note: 'Crowdsourced; may not reflect this cycle.' },
  { fields: 'Pakistani graduates matched', sources: ['Community reports'], note: 'Based on reported outcomes, not official NRMP data.' },
  { fields: 'Crowdsourced outcomes & notes', sources: ['Community reports', 'ResidencyMatch.net'], note: 'Anecdotal — use for context only.' },
]

export const DISCLAIMER_SHORT =
  'Independent tool — not affiliated with NRMP, AAMC, AMA, ECFMG, or any residency program. Scores support thoughtful program fit; they are not predictions. Verify all program information before applying.'

export const PRIVACY_LOCAL =
  'Your profile, tier list, signals, connections, notes, and application statuses stay in this browser — your private list is not uploaded to our servers.'

export const PRIVACY_ACCOUNT =
  'Sign-in and optional community submissions (interview reports, corrections) are stored securely so you can contribute across sessions.'

export const PRIVACY_SHORT = `${PRIVACY_LOCAL} ${PRIVACY_ACCOUNT}`

export const DISCLAIMER_FOOTER =
  'ResidencyCompass is an independent exploration aid for program fit. Program facts are manually curated from NRMP program identifiers, ResidencyMatch.net crowdsourced reports, and community reports. We do not copy, scrape, or redistribute data from FREIDA (AMA) or Residency Explorer (AAMC). Always verify on program websites and other official sources before applying.'

export const DISCLAIMER_BULLETS = [
  'Scores are heuristics to help Pakistani IMG applicants explore mutual program fit. They are not predictions or guarantees of interview invites or match outcomes.',
  'ResidencyCompass is not affiliated with, endorsed by, or authorized to redistribute data from NRMP, AAMC, AMA, ECFMG, or any residency program.',
  'We do not copy, scrape, or republish FREIDA (AMA) or Residency Explorer™ material. Residency Explorer may only be used on residencyexplorer.org for personal application research.',
  'Program fields are compiled from manual curation and community reports. They may be incomplete, outdated, or inaccurate.',
  'Median Step 2 values and interview reports from ResidencyMatch.net and similar sites are crowdsourced — confirm on program websites.',
  'Always verify visa sponsorship, position counts, PD details, and deadlines directly with each program before applying.',
]

export function formatVerifiedLabel(lastVerified) {
  if (!lastVerified) return 'Unknown'
  const year = parseInt(String(lastVerified), 10)
  if (!Number.isFinite(year)) return String(lastVerified)
  const age = new Date().getFullYear() - year
  if (age <= 0) return `${year} (this cycle)`
  if (age === 1) return `${year} (1 year ago)`
  return `${year} (${age} years ago)`
}

export function isDataStale(lastVerified, maxAgeYears = 2) {
  const year = parseInt(String(lastVerified ?? ''), 10)
  if (!Number.isFinite(year)) return true
  return new Date().getFullYear() - year > maxAgeYears
}

export function computeListFreshness(programs) {
  const curatorSources = [...new Set(programs.map((p) => p.source).filter(Boolean))]
  const years = programs
    .map((p) => parseInt(p.last_verified, 10))
    .filter((y) => Number.isFinite(y))

  const minYear = years.length ? Math.min(...years) : null
  const maxYear = years.length ? Math.max(...years) : null
  const verifiedLabel =
    minYear == null ? null
    : minYear === maxYear ? String(minYear)
    : `${minYear}–${maxYear}`

  const ageYears = maxYear != null ? new Date().getFullYear() - maxYear : null
  const staleCount = programs.filter((p) => isDataStale(p.last_verified)).length

  return {
    curatorSource:
      curatorSources.length === 1 ? curatorSources[0]
      : curatorSources.length > 1 ? `${curatorSources.length} curator notes`
      : null,
    verifiedLabel,
    isStale: ageYears != null && ageYears > 1,
    isVeryStale: ageYears != null && ageYears > 2,
    staleCount,
    total: programs.length,
  }
}

export function getProgramFieldHints(program) {
  return [
    {
      label: 'Median Step 2',
      value: program.median_step2,
      sources: 'ResidencyMatch.net (crowdsourced)',
      verify: 'Program website',
    },
    {
      label: 'Visa & positions',
      value: program.visa_type || program.pgy_positions,
      sources: 'Manual curation · community reports',
      verify: 'Program website',
    },
    {
      label: 'Pakistani graduates matched',
      value: program.pak_matched || program.dow_matched,
      sources: 'Community reports',
      verify: 'Program website / your own research',
    },
    {
      label: 'Outcomes & notes',
      value: program.crowdsourced_outcomes || program.program_notes,
      sources: 'Community reports',
      verify: 'Treat as anecdotal',
    },
  ].filter((row) => row.value)
}
