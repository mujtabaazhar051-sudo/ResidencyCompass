/**
 * Removes personal names and private notes from community program data.
 * Run after mergeMasterCsv.js or before deploy:  node scripts/redactCommunityNotes.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PROGRAMS_FILE = join(ROOT, 'src', 'data', 'programs.json')

const require = createRequire(import.meta.url)
const { CLEANED: CLEANED_1 } = require('./cleanOutcomes.cjs')
const { CLEANED: CLEANED_2 } = require('./cleanOutcomes2.cjs')
const CLEANED = { ...CLEANED_1, ...CLEANED_2 }

const PERSONAL_NAMES = [
  'Nader Guma', 'Samina Ghazi', 'Talha Ghazi',
  'Mizba Mohiuddin', 'Mizba Mohiduddin',
  'Hamza Tahir', 'Atif Masood', 'Rafi Aibani',
  'Sana Habib', 'Abdur Raheem', 'Abdul Raheem', 'Syed Umair',
  'Yumna Timsaal', 'Yumna Timsal', 'Aniqa Baloch', 'Aqsa Saleem',
  'Huda Jaffar', 'Umer Hayat', 'Ramsha Abdul Qadir', 'Ramsha Abdul',
  'Anooja Rani', 'Sara Ahmed', 'Syed Muhammad', 'Sameer Garlapati',
  'Hassan Ahmed', 'Adila Afzal', 'Deedar', 'Omaise', 'Bayan Zafar',
  'Owais', 'Hira Chohan', 'Hira Majid', 'Javeria Hayat', 'Rameen Shahid',
  'Nader', 'Samina', 'Talha', 'Hania', 'Asadulla', 'ASadulla',
  'Mizba', 'Hamza', 'Atif', 'Rafi', 'Sana', 'Abdur', 'Abdul', 'Umair',
  'Yumna', 'Ramsha', 'Aniqa', 'Aqsa', 'Huda', 'Umer', 'Anooja',
  'Guma', 'Ghazi', 'Mohiuddin', 'Mohiduddin',
  'Tahir', 'Masood', 'Aibani', 'Habib', 'Raheem',
  'Tobi', 'Gaurav', 'Michelle',
]

const NAMES_RE = new RegExp(
  PERSONAL_NAMES
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gi',
)

const APPLICANT_RE = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s*\((\d{3})\)/g
const FIRST_PERSON_RE =
  /\b(?:Will|Have to|I should|my email|Will apply|Will signal|Will see|Will write|Will try|Will definetly|Will send|Applied here|Cant access|No need to signal)\b[^.]*\.?\s*/gi
const USER_PRIORITY_RE = /User priority:\s*\d+\/5\.?\s*/gi

function autoRedact(text) {
  if (!text) return text
  let out = text
    .replace(APPLICANT_RE, 'Pakistani IMG ($1)')
    .replace(NAMES_RE, '')
    .replace(/\bDr\.\s+[A-Z][a-z]+\b/g, 'program contact')
    .replace(FIRST_PERSON_RE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/^[\/\s,.-]+|[\/\s,.-]+$/g, '')
    .trim()
  out = out.replace(/\.\s*\./g, '.').replace(/\s+\./g, '.')
  return out
}

function cleanProgramNotes(text) {
  if (!text) return ''
  return text.replace(USER_PRIORITY_RE, '').replace(/\.\s*\./g, '.').replace(/^[\s.]+|[\s.]+$/g, '').trim()
}

const programs = JSON.parse(readFileSync(PROGRAMS_FILE, 'utf-8'))
let curated = 0
let auto = 0
let notes = 0

for (const p of programs) {
  if (CLEANED[p.program_code] !== undefined) {
    p.crowdsourced_outcomes = CLEANED[p.program_code]
    curated++
  } else if (p.crowdsourced_outcomes) {
    const redacted = autoRedact(p.crowdsourced_outcomes)
    if (redacted !== p.crowdsourced_outcomes) {
      p.crowdsourced_outcomes = redacted
      auto++
    }
  }

  const cleanedNotes = cleanProgramNotes(p.program_notes)
  if (cleanedNotes !== (p.program_notes || '')) {
    p.program_notes = cleanedNotes
    notes++
  }

  p.known_contacts = ''
}

writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2))

console.log(`✓ Redacted community notes in ${PROGRAMS_FILE}`)
console.log(`  Curated outcomes: ${curated}`)
console.log(`  Auto-redacted outcomes: ${auto}`)
console.log(`  Cleared user-priority notes: ${notes}`)
