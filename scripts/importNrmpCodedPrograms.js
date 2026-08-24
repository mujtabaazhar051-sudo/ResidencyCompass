/**
 * Import master-sheet rows that used NRMP codes instead of ACGME 10-digit IDs.
 * Run: node scripts/importNrmpCodedPrograms.js
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CSV = join(
  process.env.USERPROFILE,
  'Downloads',
  '(Main) Master Program List Match 2026 - Sheet1.csv',
)

/** NRMP categorical track code → ACGME program ID */
const NRMP_TO_ACGME = {
  '1616140C0': '1404131367', // Conemaugh Memorial Medical Center
  '2086140C1': '1403300541', // Inspira Mullica Hill
  '1080140C0': '1400811075', // Quinnipiac / St. Vincent's
  '2980140C0': '1405121432', // Old Dominion / EVMS (may already exist)
  '2335140C8': '1401100019', // Physicians Regional Pine Ridge
  '1089140C2': '1400800910', // UConn / Waterbury
  '1094140C2': '1400800910', // UConn / Waterbury (alt NRMP listing)
  '1241140C0': '1402331152', // Greater Baltimore Medical Center
  '2984140C0': '1402800917', // HCA Overland Park
  '1991140C0': '1400400925', // White River Health
  '1867140C0': '1401200930', // AdventHealth Redmond
}

const STATE_REGIONS = {
  ME: 'New England', NH: 'New England', VT: 'New England', MA: 'New England', RI: 'New England', CT: 'New England',
  NY: 'Middle Atlantic', NJ: 'Middle Atlantic', PA: 'Middle Atlantic',
  OH: 'East North Central', IN: 'East North Central', IL: 'East North Central', MI: 'East North Central', WI: 'East North Central',
  MN: 'West North Central', IA: 'West North Central', MO: 'West North Central', ND: 'West North Central',
  SD: 'West North Central', NE: 'West North Central', KS: 'West North Central',
  DE: 'South Atlantic', MD: 'South Atlantic', DC: 'South Atlantic', VA: 'South Atlantic', WV: 'South Atlantic',
  NC: 'South Atlantic', SC: 'South Atlantic', GA: 'South Atlantic', FL: 'South Atlantic',
  KY: 'East South Central', TN: 'East South Central', AL: 'East South Central', MS: 'East South Central',
  AR: 'West South Central', LA: 'West South Central', OK: 'West South Central', TX: 'West South Central',
  MT: 'Mountain', ID: 'Mountain', WY: 'Mountain', CO: 'Mountain', NM: 'Mountain', AZ: 'Mountain', UT: 'Mountain', NV: 'Mountain',
  WA: 'Pacific', OR: 'Pacific', CA: 'Pacific', AK: 'Pacific', HI: 'Pacific',
}

function parseCSV(text) {
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const records = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '"') {
      if (inQ && src[i + 1] === '"') {
        cur += '"'
        i++
      } else inQ = !inQ
      cur += ch
    } else if (ch === '\n' && !inQ) {
      records.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) records.push(cur)

  function split(rec) {
    const fields = []
    let f = ''
    let q = false
    for (let i = 0; i < rec.length; i++) {
      const ch = rec[i]
      if (ch === '"') {
        if (q && rec[i + 1] === '"') {
          f += '"'
          i++
        } else q = !q
      } else if (ch === ',' && !q) {
        fields.push(f.trim())
        f = ''
      } else f += ch
    }
    fields.push(f.trim())
    return fields
  }

  const nonEmpty = records.filter((r) => r.trim())
  const headers = split(nonEmpty[0]).map((h) => h.replace(/^"|"$/g, '').trim())
  return nonEmpty.slice(1).map((rec) => {
    const vals = split(rec).map((v) => v.replace(/^"|"$/g, '').trim())
    const row = {}
    headers.forEach((h, i) => {
      row[h] = (vals[i] || '').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
    })
    return row
  })
}

function normalizeVisa(raw) {
  const v = (raw || '').trim()
  if (/no visa/i.test(v)) return 'No sponsorship'
  if (/j1.*h1b|h1b.*j1/i.test(v)) return 'J1 & H1B'
  if (/j1/i.test(v)) return 'J1 only'
  if (/h1b/i.test(v)) return 'H1B only'
  return v || 'Unknown'
}

function normalizeProgramType(raw) {
  const v = (raw || '').trim()
  if (/community/i.test(v)) return 'Community'
  if (/affiliated/i.test(v)) return 'Affiliated hospital'
  if (/universit/i.test(v)) return 'University'
  return v || 'Unknown'
}

function normalizeDowPak(raw) {
  const v = (raw || '').trim().toUpperCase()
  if (v === 'YES') return 'YES'
  if (v === 'NO') return 'NO'
  return 'NOT SURE'
}

function extractSignalPolicy(comments) {
  const c = comments.toLowerCase()
  if (/must signal|will only review signal|only review.*signal/.test(c)) return 'Signal required'
  if (/signal required|mandatory signal/.test(c)) return 'Signal required'
  if (/100% signal|signal.*100%/.test(c)) return 'Signal required — 100% signaling rate'
  if (/preferentially review.*signal|signal.*preferential/.test(c)) return 'Signal strongly preferred'
  if (/all applicants should signal/.test(c)) return 'Signal required — all applicants should signal'
  if (/should signal|signal.*if interested|please.*signal/.test(c)) return 'Signal helps'
  if (/no sign|not signaling|dont signal/.test(c)) return 'No signal required'
  return ''
}

function rowToProgram(row, acgmeCode) {
  const name = (row['Program'] || '').replace(/\s+/g, ' ').trim()
  const state = (row['State'] || '').trim().toUpperCase()
  const comments = (row['Comments'] || '').replace(/\s+/g, ' ').trim()
  const medianStep2Raw = (row['Median Step 2'] || '').trim()
  const medianStep2 = /^[-–—]$/.test(medianStep2Raw) ? '' : medianStep2Raw
  const deanLOR = (row['Deans LOR'] || '').trim()
  const notesParts = []
  if (deanLOR && !/not sure/i.test(deanLOR)) notesParts.push(`Dean's LOR: ${deanLOR}`)

  return {
    program_code: acgmeCode,
    program_name: name,
    state,
    region: STATE_REGIONS[state] || '',
    program_type: normalizeProgramType(row['affiliated hospital']),
    visa_type: normalizeVisa(row['Visa status']),
    phone: (row['Phone'] || '').trim(),
    email: (row['Email'] || '').trim(),
    pd_name: (row['PD'] || '').trim(),
    website: (row['Website'] || '').trim(),
    pgy_positions: (row['PGY Positions'] || '').trim(),
    median_step2: medianStep2,
    dow_matched: normalizeDowPak(row['DOW MATCHED']),
    pak_matched: normalizeDowPak(row['PAK MATCHED']),
    signal_policy: extractSignalPolicy(comments),
    known_contacts: '',
    crowdsourced_outcomes: comments,
    program_notes: notesParts.join('. '),
    last_verified: '2026',
    source: 'Program List Match 2026',
  }
}

const programs = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'programs.json'), 'utf8'))
const byCode = Object.fromEntries(programs.map((p) => [p.program_code, p]))
const rows = parseCSV(readFileSync(CSV, 'utf8'))

const added = []
const updated = []
const skipped = []

for (const row of rows) {
  const sheetCode = (row['Program code'] || '').trim().toUpperCase()
  const name = (row['Program'] || '').trim()
  if (!sheetCode && /beebe/i.test(name)) {
    skipped.push(`${name} — pending ACGME accreditation (no program ID yet)`)
    continue
  }
  const acgme = NRMP_TO_ACGME[sheetCode]
  if (!acgme) continue

  const next = rowToProgram(row, acgme)
  const prev = byCode[acgme]
  if (prev) {
    // Prefer existing name if sheet name is shorter/weaker; otherwise refresh contacts/notes from sheet
    Object.assign(prev, {
      ...next,
      program_name: prev.program_name || next.program_name,
      crowdsourced_outcomes: next.crowdsourced_outcomes || prev.crowdsourced_outcomes,
      median_step2: next.median_step2 || prev.median_step2,
    })
    updated.push(`${acgme} ${prev.program_name}`)
  } else {
    programs.push(next)
    byCode[acgme] = next
    added.push(`${acgme} ${next.program_name} (${next.state}, ${next.visa_type})`)
  }
}

programs.sort((a, b) => a.program_name.localeCompare(b.program_name))
writeFileSync(join(ROOT, 'src', 'data', 'programs.json'), JSON.stringify(programs, null, 2) + '\n')

console.log(`Total programs: ${programs.length}`)
console.log(`\nAdded (${added.length}):`)
added.forEach((x) => console.log('  +', x))
console.log(`\nUpdated existing (${updated.length}):`)
updated.forEach((x) => console.log('  ~', x))
console.log(`\nSkipped (${skipped.length}):`)
skipped.forEach((x) => console.log('  -', x))
