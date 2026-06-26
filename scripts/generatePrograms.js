/**
 * Converts the user's Google Sheets CSVs into:
 *   src/data/programs.json   — canonical program list
 *   src/data/initialState.json — pre-populated signals + connections
 *
 * Run: node scripts/generatePrograms.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── State → Census Region ─────────────────────────────────────────────────────
const STATE_REGIONS = {
  ME:'New England',NH:'New England',VT:'New England',MA:'New England',RI:'New England',CT:'New England',
  NY:'Middle Atlantic',NJ:'Middle Atlantic',PA:'Middle Atlantic',
  OH:'East North Central',IN:'East North Central',IL:'East North Central',MI:'East North Central',WI:'East North Central',
  MN:'West North Central',IA:'West North Central',MO:'West North Central',ND:'West North Central',
  SD:'West North Central',NE:'West North Central',KS:'West North Central',
  DE:'South Atlantic',MD:'South Atlantic',DC:'South Atlantic',VA:'South Atlantic',WV:'South Atlantic',
  NC:'South Atlantic',SC:'South Atlantic',GA:'South Atlantic',FL:'South Atlantic',
  KY:'East South Central',TN:'East South Central',AL:'East South Central',MS:'East South Central',
  AR:'West South Central',LA:'West South Central',OK:'West South Central',TX:'West South Central',
  MT:'Mountain',ID:'Mountain',WY:'Mountain',CO:'Mountain',NM:'Mountain',AZ:'Mountain',UT:'Mountain',NV:'Mountain',
  WA:'Pacific',OR:'Pacific',CA:'Pacific',AK:'Pacific',HI:'Pacific',
}

// ── Per-program connection map ─────────────────────────────────────────────────
// Derived by manually reading every Comments cell and matching against the user's
// 12 personal connections: Nader Guma, Samina Ghazi, Talha (Ghazi), Hania,
// Asadulla, Mizba Mohiuddin, Hamza Tahir, Atif Masood, Rafi Aibani,
// Sana Habib, Abdur Raheem, Syed Umair.
//
// strength key:
//   strong   = "said he will recommend" / confirmed recommendation
//   moderate = named in context / "might recommend" / "probably recommend"
//   weak     = "have to talk to" / very indirect mention
const CONNECTIONS = {
  // Sinai Grace — Samina, Hania, Asadulla all named
  '1402521506': { strength: 'moderate', count: 3, names: 'Samina Ghazi, Hania, Asadulla' },
  // Trinity Oakland — Hania, Samina named
  '1402511200': { strength: 'moderate', count: 2, names: 'Hania, Samina Ghazi' },
  // Central Michigan — Mizba "will probably recommend, must signal here. Will ask Talha bhai"
  '1402531202': { strength: 'strong',   count: 2, names: 'Mizba Mohiuddin, Talha' },
  // Cayuga — Hamza Tahir named
  '1403500931': { strength: 'moderate', count: 1, names: 'Hamza Tahir' },
  // Insight Chicago — Nader Guma "said he is new chief resident and might recommend", Abdur Raheem
  '1401600001': { strength: 'moderate', count: 2, names: 'Nader Guma, Abdur Raheem' },
  // Rutgers/Trinitas — Atif Masood "said he will recommend me"
  '1403321498': { strength: 'strong',   count: 1, names: 'Atif Masood' },
  // Trinity Livonia — Mizba "will probably recommend again this cycle"
  '1402512540': { strength: 'strong',   count: 1, names: 'Mizba Mohiuddin' },
  // Henry Ford Providence — Samina Ghazi, Abdur Raheem named
  '1402511203': { strength: 'moderate', count: 2, names: 'Samina Ghazi, Abdur Raheem' },
  // Michigan State / Sparrow — Talha Ghazi named
  '1402521195': { strength: 'moderate', count: 1, names: 'Talha Ghazi' },
  // CAMC Charleston — Rafi Aibani named
  '1405511438': { strength: 'moderate', count: 1, names: 'Rafi Aibani' },
  // Garden City Hospital — "Dr. Asadulla Mohammed. Have to talk to him if he can recommend."
  '1402500915': { strength: 'weak',     count: 1, names: 'Asadulla Mohammed' },
  // Western Michigan — Sana Habib named, "Will followup on text"
  '1402521199': { strength: 'moderate', count: 1, names: 'Sana Habib' },
  // Trinity Grand Rapids — Talha Ghazi "said he can talk to someone"
  '1402500927': { strength: 'moderate', count: 1, names: 'Talha Ghazi' },
  // DMC Wayne State main — Asadulla, Samina, Hania all doctors there
  '1402521194': { strength: 'strong',   count: 3, names: 'Asadulla, Samina Ghazi, Hania' },
  // UCF / HCA Gainesville — Syed Umair "should ask him if recommending"
  '1401100938': { strength: 'moderate', count: 1, names: 'Syed Umair' },
}

// ── CSV parser (handles quoted multiline fields and escaped quotes) ─────────────
function parseCSV(text) {
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split into logical records (respecting quoted newlines)
  const records = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '"') {
      if (inQ && src[i + 1] === '"') { cur += '"'; i++ }   // escaped ""
      else { inQ = !inQ; cur += ch }                        // keep quote char
    } else if (ch === '\n' && !inQ) {
      records.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim()) records.push(cur)

  // Split one record into fields (strip outer quotes, handle inner commas)
  function splitRecord(rec) {
    const fields = []
    let field = ''
    let inQ = false
    for (let i = 0; i < rec.length; i++) {
      const ch = rec[i]
      if (ch === '"') {
        if (inQ && rec[i + 1] === '"') { field += '"'; i++ }
        else inQ = !inQ   // strip outer quotes
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

  const nonEmpty = records.filter(r => r.trim())
  if (!nonEmpty.length) return { headers: [], rows: [] }

  const headers = splitRecord(nonEmpty[0]).map(h => h.trim())
  const rows = nonEmpty.slice(1).map(rec => {
    const vals = splitRecord(rec)
    const row = {}
    headers.forEach((h, i) => {
      // Collapse internal newlines/extra spaces in cell content
      row[h] = (vals[i] || '').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
    })
    return row
  }).filter(row => headers.some(h => row[h]))

  return { headers, rows }
}

// ── Field helpers ─────────────────────────────────────────────────────────────

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

// ── Main conversion ────────────────────────────────────────────────────────────

const CSV_PATH = 'C:\\Users\\Mujtaba Azhar\\Downloads\\Master Program List Match 2026 - Sheet1.csv'
const masterCSV = readFileSync(CSV_PATH, 'utf-8')
const { rows } = parseCSV(masterCSV)

const signals = {}
const programs = []
const seenCodes = new Set()
let skipped = 0

for (const row of rows) {
  const code = (row['Program code'] || '').trim()
  const rawName = (row['Program'] || '').replace(/\s+/g, ' ').trim()
  const visa = (row['Visa status'] || '').trim()

  // Must have a 10-digit program code
  if (!code || !/^\d{10}$/.test(code)) { skipped++; continue }
  if (!rawName) { skipped++; continue }
  if (/no visa/i.test(visa)) { skipped++; continue }   // no sponsorship — skip
  if (seenCodes.has(code)) continue
  seenCodes.add(code)

  const state = (row['State'] || '').trim().toUpperCase()
  const comments = (row['Comments'] || '').replace(/\s+/g, ' ').trim()
  const signal = (row['Signal'] || '').trim().toLowerCase()
  const medianStep2Raw = (row['Median Step 2'] || '').trim()
  const medianStep2 = /^[-–—]$/.test(medianStep2Raw) ? '' : medianStep2Raw
  const deanLOR = (row['Deans LOR'] || '').trim()
  const rate = (row['Rate'] || '').trim()

  const signalPolicy = extractSignalPolicy(comments)

  // program_notes: operational facts extracted from structured columns
  const notesParts = []
  if (deanLOR && !/not sure/i.test(deanLOR)) notesParts.push(`Dean's LOR: ${deanLOR}`)
  if (rate !== '' && rate !== '0') notesParts.push(`User priority: ${rate}/5`)

  const program = {
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
    last_verified: '2025',
    source: 'Program List Match 2026',
  }

  programs.push(program)

  if (signal === 'gold') signals[code] = 'gold'
  else if (signal === 'silver') signals[code] = 'silver'
}

// ── Write output ──────────────────────────────────────────────────────────────

writeFileSync(
  join(ROOT, 'src', 'data', 'programs.json'),
  JSON.stringify(programs, null, 2)
)
console.log(`✓ programs.json — ${programs.length} programs (${skipped} rows skipped)`)

writeFileSync(
  join(ROOT, 'src', 'data', 'initialState.json'),
  JSON.stringify({ signals, connections: CONNECTIONS }, null, 2)
)
console.log(`✓ initialState.json — ${Object.keys(signals).length} signals, ${Object.keys(CONNECTIONS).length} connections`)

// ── Summary ───────────────────────────────────────────────────────────────────
const goldCount   = Object.values(signals).filter(v => v === 'gold').length
const silverCount = Object.values(signals).filter(v => v === 'silver').length
console.log(`   Gold: ${goldCount}  Silver: ${silverCount}  Total: ${goldCount + silverCount}/15`)

const connMap = programs.reduce((acc, p) => {
  if (CONNECTIONS[p.program_code]) acc[p.program_name] = CONNECTIONS[p.program_code]
  return acc
}, {})
console.log(`\nConnections mapped to programs:`)
for (const [name, conn] of Object.entries(connMap)) {
  console.log(`  ${conn.strength.padEnd(8)} ×${conn.count} | ${name} → ${conn.names}`)
}
