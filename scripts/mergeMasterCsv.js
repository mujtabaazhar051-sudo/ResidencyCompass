/**
 * Merge updated master CSV into programs.json, preserving programs
 * only in the existing list and ResidencyMatch-enriched outcomes where useful.
 *
 * Run: node scripts/mergeMasterCsv.js [path-to-csv]
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const DEFAULT_CSV =
  'C:\\Users\\Mujtaba Azhar\\Downloads\\Master Program List Match 2026 - Sheet1 (1).csv'
const CSV_PATH = process.argv[2] || DEFAULT_CSV

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

const CONNECTIONS = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'initialState.json'), 'utf-8'),
).connections || {}

function parseCSV(text) {
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const records = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '"') {
      if (inQ && src[i + 1] === '"') { cur += '"'; i++ }
      else { inQ = !inQ; cur += ch }
    } else if (ch === '\n' && !inQ) {
      records.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim()) records.push(cur)

  function splitRecord(rec) {
    const fields = []
    let field = ''
    let inQ = false
    for (let i = 0; i < rec.length; i++) {
      const ch = rec[i]
      if (ch === '"') {
        if (inQ && rec[i + 1] === '"') { field += '"'; i++ }
        else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        fields.push(field.trim())
        field = ''
      } else {
        field += ch
      }
    }
    fields.push(field.trim())
    return fields
  }

  const nonEmpty = records.filter((r) => r.trim())
  const headers = splitRecord(nonEmpty[0]).map((h) => h.trim())
  const rows = nonEmpty.slice(1).map((rec) => {
    const vals = splitRecord(rec)
    const row = {}
    headers.forEach((h, i) => {
      row[h] = (vals[i] || '').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
    })
    return row
  }).filter((row) => headers.some((h) => row[h]))

  return { headers, rows }
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

const NAME_FIXES = {
  '1401600543': 'Chicago Medical School/RFU / Northwestern Medicine McHenry Hospital Program',
}
const STATE_FIXES = {
  '1401200928': 'GA',
  '1403821348': 'OH',
  '1404111392': 'PA',
}

function rowToProgram(row) {
  const code = (row['Program code'] || '').trim()
  let rawName = (row['Program'] || '').replace(/\s+/g, ' ').trim()
  const visa = (row['Visa status'] || '').trim()
  if (!code || !/^\d{10}$/.test(code) || !rawName) return null
  if (NAME_FIXES[code]) rawName = NAME_FIXES[code]

  const state = STATE_FIXES[code] || (row['State'] || '').trim().toUpperCase()
  const comments = (row['Comments'] || '').replace(/\s+/g, ' ').trim()
  const medianStep2Raw = (row['Median Step 2'] || '').trim()
  const medianStep2 = /^[-–—]$/.test(medianStep2Raw) ? '' : medianStep2Raw
  const deanLOR = (row['Deans LOR'] || '').trim()
  const rate = (row['Rate'] || '').trim()
  const signalPolicy = extractSignalPolicy(comments)

  const notesParts = []
  if (deanLOR && !/not sure/i.test(deanLOR)) notesParts.push(`Dean's LOR: ${deanLOR}`)

  return {
    program_code: code,
    program_name: rawName,
    state,
    region: STATE_REGIONS[state] || '',
    program_type: normalizeProgramType(row['affiliated hospital']),
    visa_type: normalizeVisa(visa),
    phone: (row['Phone'] || '').trim(),
    email: (row['Email'] || '').trim(),
    pd_name: (row['PD'] || '').trim(),
    website: (row['Website'] || '').trim(),
    pgy_positions: (row['PGY Positions'] || '').trim(),
    median_step2: medianStep2,
    dow_matched: normalizeDowPak(row['DOW MATCHED']),
    pak_matched: normalizeDowPak(row['PAK MATCHED']),
    signal_policy: signalPolicy,
    known_contacts: CONNECTIONS[code]?.names || '',
    crowdsourced_outcomes: comments,
    program_notes: notesParts.join('. '),
    last_verified: '2026',
    source: 'Program List Match 2026',
  }
}

function mergeRmSnippet(oldOutcomes, newOutcomes) {
  const rmMatch = (oldOutcomes || '').match(/ResMatch[^.]*\./i)
  if (!rmMatch) return newOutcomes
  if ((newOutcomes || '').toLowerCase().includes('resmatch')) return newOutcomes
  const snippet = rmMatch[0].trim()
  if (!snippet) return newOutcomes
  return newOutcomes ? `${newOutcomes} ${snippet}` : snippet
}

const existing = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'programs.json'), 'utf-8'))
const existingByCode = Object.fromEntries(existing.map((p) => [p.program_code, p]))
const { rows } = parseCSV(readFileSync(CSV_PATH, 'utf-8'))

const merged = []
const seen = new Set()
const addedPrograms = []
let updated = 0
let added = 0
let fieldChanges = { median_step2: 0, email: 0, phone: 0, pd_name: 0, website: 0, pgy_positions: 0 }

for (const row of rows) {
  const fromCsv = rowToProgram(row)
  if (!fromCsv || seen.has(fromCsv.program_code)) continue
  seen.add(fromCsv.program_code)

  const prev = existingByCode[fromCsv.program_code]
  if (prev) {
    for (const key of Object.keys(fieldChanges)) {
      const oldVal = (prev[key] || '').trim()
      const newVal = (fromCsv[key] || '').trim()
      if (newVal && newVal !== oldVal) fieldChanges[key]++
    }
    fromCsv.crowdsourced_outcomes = mergeRmSnippet(
      prev.crowdsourced_outcomes,
      fromCsv.crowdsourced_outcomes,
    )
    fromCsv.program_notes = fromCsv.program_notes || prev.program_notes
    fromCsv.known_contacts = ''
    updated++
  } else {
    added++
    addedPrograms.push({
      code: fromCsv.program_code,
      name: fromCsv.program_name,
      state: fromCsv.state,
      visa: fromCsv.visa_type,
    })
  }
  merged.push(fromCsv)
}

for (const p of existing) {
  if (!seen.has(p.program_code)) {
    merged.push({ ...p, last_verified: p.last_verified || '2025' })
  }
}

merged.sort((a, b) => a.program_name.localeCompare(b.program_name))

writeFileSync(join(ROOT, 'src', 'data', 'programs.json'), JSON.stringify(merged, null, 2))

const signals = {}
for (const row of rows) {
  const code = (row['Program code'] || '').trim()
  const signal = (row['Signal'] || '').trim().toLowerCase()
  if (!/^\d{10}$/.test(code)) continue
  if (signal === 'gold') signals[code] = 'gold'
  else if (signal === 'silver') signals[code] = 'silver'
}

writeFileSync(
  join(ROOT, 'src', 'data', 'initialState.json'),
  JSON.stringify({ signals, connections: CONNECTIONS }, null, 2),
)

execSync('node scripts/redactCommunityNotes.js', { cwd: ROOT, stdio: 'inherit' })

console.log(`✓ Merged ${merged.length} programs from CSV: ${CSV_PATH}`)
console.log(`  Updated from CSV: ${updated}  Added: ${added}  Kept (not in CSV): ${merged.length - updated - added}`)
console.log('  Field updates:', fieldChanges)

function visaGroup(v) {
  const s = (v || '').toLowerCase()
  if (/no visa|no sponsorship/.test(s)) return 'no'
  if (/unknown|^$/.test(s)) return 'unknown'
  return 'yes'
}

console.log('\n── New programs added to the website ──')
if (!addedPrograms.length) {
  console.log('  (none)')
} else {
  const yes = addedPrograms.filter((p) => visaGroup(p.visa) === 'yes')
  const no = addedPrograms.filter((p) => visaGroup(p.visa) === 'no')
  const unknown = addedPrograms.filter((p) => visaGroup(p.visa) === 'unknown')
  console.log(`  Sponsoring: ${yes.length}  No sponsorship: ${no.length}  Unknown: ${unknown.length}`)
  for (const p of addedPrograms.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ✓ ${p.name} (${p.state} · ${p.code}) — ${p.visa}`)
  }
}
