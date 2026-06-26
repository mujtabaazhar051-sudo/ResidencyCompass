/**
 * Strips all personal data from programs.json and clears initialState.json
 * so the app is safe to deploy publicly.
 *
 * Run BEFORE deploying:  node scripts/sanitize.js
 * Then rebuild:          npm run build
 *
 * The original files are NOT modified — sanitized versions are written to
 * src/data/programs.sanitized.json and src/data/initialState.sanitized.json.
 * Swap them in manually when ready to publish.
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA  = join(ROOT, 'src', 'data')

// ── Personal names to scrub from text fields ──────────────────────────────────
// Add / remove names here as needed before each publish run.
// Full names AND every individual first/last name listed
const PERSONAL_NAMES = [
  // Full names first (longest → matched before partials)
  'Nader Guma', 'Samina Ghazi', 'Talha Ghazi',
  'Mizba Mohiuddin', 'Mizba Mohiduddin',
  'Hamza Tahir', 'Atif Masood', 'Rafi Aibani',
  'Sana Habib', 'Abdur Raheem', 'Abdul Raheem', 'Syed Umair',
  // Individual first names
  'Nader', 'Samina', 'Talha', 'Hania', 'Asadulla',
  'Mizba', 'Hamza', 'Atif', 'Rafi', 'Sana', 'Abdur', 'Abdul', 'Umair',
  // Individual last names
  'Guma', 'Ghazi', 'Mohiuddin', 'Mohiduddin',
  'Tahir', 'Masood', 'Aibani', 'Habib', 'Raheem',
]

// Build a single regex that matches any of the names (case-insensitive)
const NAMES_RE = new RegExp(
  PERSONAL_NAMES
    .sort((a, b) => b.length - a.length) // longest first to avoid partial matches
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gi'
)

function redact(text) {
  if (!text) return text
  return text.replace(NAMES_RE, '[contact]')
}

// ── Sanitize programs.json ────────────────────────────────────────────────────
const programs = JSON.parse(readFileSync(join(DATA, 'programs.json'), 'utf-8'))

const sanitized = programs.map((p) => ({
  ...p,
  // Redact personal names from free-text fields
  crowdsourced_outcomes: redact(p.crowdsourced_outcomes),
  program_notes: redact(p.program_notes)
    // Remove "User priority: X/5" lines (personal rating)
    .replace(/User priority:\s*\d+\/5\.?\s*/gi, '')
    .trim(),
  // Clear the pre-populated known contacts (personal)
  known_contacts: '',
}))

writeFileSync(
  join(DATA, 'programs.sanitized.json'),
  JSON.stringify(sanitized, null, 2)
)
console.log(`✓ programs.sanitized.json written (${sanitized.length} programs)`)

// ── Clear initialState.json ───────────────────────────────────────────────────
writeFileSync(
  join(DATA, 'initialState.sanitized.json'),
  JSON.stringify({ signals: {}, connections: {} }, null, 2)
)
console.log('✓ initialState.sanitized.json written (empty signals + connections)')

console.log(`
To publish:
  1. cp src/data/programs.sanitized.json src/data/programs.json
  2. cp src/data/initialState.sanitized.json src/data/initialState.json
  3. npm run build
  4. Deploy the dist/ folder

To restore your personal data after building:
  5. node scripts/generatePrograms.js
`)
