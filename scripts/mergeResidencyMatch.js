/**
 * Merges scraped residencymatch.net data into programs.json.
 *
 * Matching strategy (in order):
 *   1. Exact NRMP program code match
 *   2. Fuzzy program name match (≥ 60% token overlap)
 *
 * Run AFTER scrapeResidencyMatch.js:
 *   node scripts/mergeResidencyMatch.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Load data ─────────────────────────────────────────────────────────────────
const rmData   = JSON.parse(readFileSync(join(__dirname, 'rm_data.json'), 'utf-8'))
const programs = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'programs.json'), 'utf-8'))

// ── Fuzzy name matcher ────────────────────────────────────────────────────────
// Normalize common medical program name abbreviations before comparing
const ABBREVS = [
  [/\buniversity\b/gi,     'univ'],
  [/\bmedical center\b/gi, 'med ctr'],
  [/\bmedical college\b/gi,'med col'],
  [/\bmed\. ctr\b/gi,      'med ctr'],
  [/\bhospital\b/gi,       'hosp'],
  [/\bhealth care\b/gi,    'hlthcare'],
  [/\bhealthcare\b/gi,     'hlthcare'],
  [/\bhealth system\b/gi,  'hlthsys'],
  [/\bfoundation\b/gi,     'fdn'],
  [/\bschool of medicine\b/gi, 'som'],
  [/\bcom\b/gi,            'com'],
  [/\bcollege of medicine\b/gi, 'com'],
  [/\baffiliated\b/gi,     'affil'],
  [/\bnorthwestern\b/gi,   'nw'],
  [/\bpennsylvania\b/gi,   'pa'],
  [/\bnew york\b/gi,       'ny'],
  [/\bnew jersey\b/gi,     'nj'],
  [/\bcalifornia\b/gi,     'ca'],
  [/\bflorida\b/gi,        'fl'],
  [/\btexas\b/gi,          'tx'],
  [/\bohio\b/gi,           'oh'],
  [/\bmichigan\b/gi,       'mi'],
  [/\billinos\b/gi,        'il'],
  [/\billinois\b/gi,       'il'],
  // Strip trailing state codes like "-NY", "-PA", "-OH"
  [/-[A-Z]{2}$/g, ''],
]

function normalize(s) {
  let n = (s || '').toLowerCase()
  for (const [pat, rep] of ABBREVS) n = n.replace(pat, rep)
  return n.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenize(s) {
  return normalize(s).split(' ').filter((t) => t.length > 1)
}

function overlap(a, b) {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  let shared = 0
  for (const t of setA) if (setB.has(t)) shared++
  const total = Math.max(setA.size, setB.size)
  return total === 0 ? 0 : shared / total
}

// Build a lookup from NRMP code → rm record
const byCode = {}
const byName = rmData
for (const rec of rmData) {
  if (rec.nrmp_code) byCode[rec.nrmp_code] = rec
}

// ── Merge ─────────────────────────────────────────────────────────────────────
let exactMatches  = 0
let fuzzyMatches  = 0
let noMatches     = 0

const updated = programs.map((prog) => {
  // 1. Try exact code match
  let rm = byCode[prog.program_code]
  if (rm) {
    exactMatches++
  } else {
    // 2. Try fuzzy name match
    let best = 0
    for (const rec of byName) {
      const score = overlap(prog.program_name, rec.program_name)
      if (score > best) { best = score; rm = rec }
    }
    if (best >= 0.5) {
      fuzzyMatches++
    } else {
      noMatches++
      if (process.env.DEBUG) console.log(`  NO MATCH: "${prog.program_name}" (best=${best.toFixed(2)})`)
      rm = null
    }
  }

  if (!rm) return prog

  // rm_data.json structure: { overall, iv_invites, matches, img_overall, non_us_img }
  // Prefer IV invite median (most relevant for applicants), fall back to overall
  const ivStats  = rm.iv_invites  || rm.overall
  const allStats = rm.overall

  const rmMedian = ivStats?.median ?? null
  const n        = allStats?.count ?? 0

  const existingMedian = parseInt(prog.median_step2, 10)
  const shouldUpdate   = rmMedian && (isNaN(existingMedian) || n >= 3)

  // Build a compact RM summary line for crowdsourced_outcomes
  const rmSummary = rmMedian
    ? `ResMatch IV median: ${rmMedian} (n=${n}, range ${allStats?.min}–${allStats?.max})`
    : null

  // Strip any previous RM summary before re-appending
  const cleanedOutcomes = (prog.crowdsourced_outcomes || '')
    .replace(/ResMatch IV median:[^.]*\.?\s*/g, '')
    .trim()

  return {
    ...prog,
    ...(shouldUpdate ? { median_step2: String(rmMedian) } : {}),
    crowdsourced_outcomes: rmSummary
      ? [cleanedOutcomes, rmSummary].filter(Boolean).join(' ')
      : prog.crowdsourced_outcomes,
  }
})

writeFileSync(join(ROOT, 'src', 'data', 'programs.json'), JSON.stringify(updated, null, 2))

console.log(`✓ programs.json updated`)
console.log(`  Exact code matches : ${exactMatches}`)
console.log(`  Fuzzy name matches : ${fuzzyMatches}`)
console.log(`  Unmatched programs : ${noMatches}`)
console.log(`\nRebuild with: npm run build`)
