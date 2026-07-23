import { useState, useMemo } from 'react'

// ── Schema fields the user can map CSV columns to ────────────────────────────

const SCHEMA_FIELDS = [
  { key: 'program_name', label: 'Program Name', required: true },
  { key: 'state', label: 'State' },
  { key: 'region', label: 'Region' },
  { key: 'program_type', label: 'Program Type' },
  { key: 'visa_type', label: 'Visa Type' },
  { key: 'pd_name', label: 'Program Director Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'pgy_positions', label: 'PGY Positions' },
  { key: 'median_step2', label: 'Median Step 2' },
  { key: 'pak_matched', label: 'Pakistani Graduates Matched (YES/NO/NOT SURE)' },
  { key: 'dow_matched', label: 'Additional pathway detail (YES/NO/NOT SURE)' },
  { key: 'signal_policy', label: 'Signal Policy' },
  { key: 'known_contacts', label: 'Known Contacts' },
  { key: 'crowdsourced_outcomes', label: 'Crowdsourced Outcomes' },
  { key: 'program_notes', label: 'Program Notes / My Notes' },
  { key: 'last_verified', label: 'Last Verified (year)' },
  { key: 'source', label: 'Source' },
  { key: '__signaled', label: 'Signaled (Gold/Silver/Yes/No) — sets signal state' },
]

// ── Auto-detect which CSV column likely maps to each schema field ─────────────

const AUTO_HINTS = {
  program_name: ['name', 'program', 'hospital'],
  state: ['state'],
  region: ['region'],
  program_type: ['type', 'program type'],
  visa_type: ['visa'],
  pd_name: ['pd', 'director', 'program director'],
  phone: ['phone', 'tel'],
  email: ['email', 'mail'],
  website: ['website', 'url', 'link'],
  pgy_positions: ['pgy', 'positions', 'spots'],
  median_step2: ['step 2', 'step2', 'median step', 'cutoff'],
  dow_matched: ['dow'],
  pak_matched: ['pak', 'pakistan'],
  signal_policy: ['signal policy', 'signal requirement'],
  known_contacts: ['contact', 'contacts', 'known'],
  crowdsourced_outcomes: ['outcome', 'crowdsource', 'reports'],
  program_notes: ['note', 'notes', 'comments', 'my notes'],
  last_verified: ['verified', 'last verified', 'year'],
  source: ['source'],
  __signaled: ['signaled', 'signal', 'my signal', 'allocated'],
}

function autoDetectMapping(headers) {
  const mapping = {}
  for (const [field, hints] of Object.entries(AUTO_HINTS)) {
    for (const header of headers) {
      const h = header.toLowerCase().trim()
      if (hints.some((hint) => h.includes(hint))) {
        mapping[field] = header
        break
      }
    }
  }
  return mapping
}

// ── CSV / TSV parser ─────────────────────────────────────────────────────────

function parseDelimited(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { headers: [], rows: [] }

  // Detect delimiter: count tabs vs commas in first line
  const firstLine = lines[0]
  const tabCount = (firstLine.match(/\t/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  const delim = tabCount >= commaCount ? '\t' : ','

  function parseLine(line) {
    const fields = []
    let inQuote = false
    let cur = ''
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === delim && !inQuote) {
        fields.push(cur); cur = ''
      } else {
        cur += ch
      }
    }
    fields.push(cur)
    return fields
  }

  const headers = parseLine(lines[0]).map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line)
    const row = {}
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim() })
    return row
  }).filter((row) => Object.values(row).some((v) => v !== ''))

  return { headers, rows }
}

function normalizeSignal(raw) {
  const v = (raw || '').toLowerCase().trim()
  if (v === 'gold' || v === 'g') return 'gold'
  if (v === 'silver' || v === 's' || v === 'yes') return 'silver'
  return null
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportModal({ onImport, onClose }) {
  const [step, setStep] = useState(1)
  const [rawText, setRawText] = useState('')
  const [mapping, setMapping] = useState({})
  const [error, setError] = useState('')

  const parsed = useMemo(() => {
    if (!rawText.trim()) return { headers: [], rows: [] }
    return parseDelimited(rawText)
  }, [rawText])

  function handleParsed() {
    if (parsed.headers.length === 0) {
      setError('Could not detect any columns. Paste the sheet including the header row.')
      return
    }
    setError('')
    setMapping(autoDetectMapping(parsed.headers))
    setStep(2)
  }

  function handleImport() {
    const missingRequired = SCHEMA_FIELDS.filter(
      (f) => f.required && !mapping[f.key]
    )
    if (missingRequired.length > 0) {
      setError(`Map the required field: ${missingRequired.map((f) => f.label).join(', ')}`)
      return
    }

    let idCounter = Date.now()
    const programs = []
    const signals = {}

    for (const row of parsed.rows) {
      const program = {
        program_code: String(idCounter++),
        program_name: '',
        state: '',
        region: '',
        program_type: '',
        visa_type: '',
        pd_name: '',
        phone: '',
        email: '',
        website: '',
        pgy_positions: '',
        median_step2: '',
        dow_matched: 'NOT SURE',
        pak_matched: 'NOT SURE',
        signal_policy: '',
        known_contacts: '',
        crowdsourced_outcomes: '',
        program_notes: '',
        last_verified: '',
        source: 'Imported',
      }

      for (const [schemaKey, csvHeader] of Object.entries(mapping)) {
        if (schemaKey === '__signaled') continue
        if (csvHeader && row[csvHeader] !== undefined) {
          program[schemaKey] = row[csvHeader]
        }
      }

      if (!program.program_name) continue

      // Handle signal column
      if (mapping.__signaled) {
        const sigVal = normalizeSignal(row[mapping.__signaled])
        if (sigVal) signals[program.program_code] = sigVal
      }

      programs.push(program)
    }

    if (programs.length === 0) {
      setError('No programs found after mapping. Check that the Program Name column is correct.')
      return
    }

    onImport(programs, signals)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Import from Google Sheets / CSV</h2>
            <p className="text-sm text-slate-500">Step {step} of 2</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                <strong>How to paste from Google Sheets:</strong>
                <ol className="mt-2 list-decimal pl-4 space-y-1">
                  <li>Select all cells in your sheet (including the header row)</li>
                  <li>Copy (Ctrl+C)</li>
                  <li>Paste below (Ctrl+V)</li>
                </ol>
                <p className="mt-2">CSV files also work — just paste the file contents. Headers are auto-detected.</p>
              </div>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Paste your spreadsheet data here
                </span>
                <textarea
                  rows={12}
                  placeholder="Program Name&#9;State&#9;Visa Type&#9;Signaled&#10;McLaren Oakland&#9;MI&#9;J1 & H1B&#9;Gold"
                  value={rawText}
                  onChange={(e) => { setRawText(e.target.value); setError('') }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {parsed.headers.length > 0 && (
                <p className="text-sm text-slate-600">
                  Detected <strong>{parsed.headers.length} columns</strong> and{' '}
                  <strong>{parsed.rows.length} programs</strong>. Click next to map columns.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Map your sheet's column headers to the program data fields. Auto-detected where possible.
                Fields left as "— skip —" will be ignored.
              </p>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Data field</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Your column</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEMA_FIELDS.map((field) => (
                      <tr key={field.key} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-800">
                          {field.label}
                          {field.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={mapping[field.key] || ''}
                            onChange={(e) =>
                              setMapping((prev) => ({ ...prev, [field.key]: e.target.value || undefined }))
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1 text-slate-800 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">— skip —</option>
                            {parsed.headers.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Preview */}
              {parsed.rows.length > 0 && mapping.program_name && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Preview (first 3 rows)
                  </p>
                  <div className="space-y-1">
                    {parsed.rows.slice(0, 3).map((row, i) => (
                      <div key={i} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        <strong>{row[mapping.program_name] || '—'}</strong>
                        {mapping.state && ` · ${row[mapping.state] || '—'}`}
                        {mapping.visa_type && ` · ${row[mapping.visa_type] || '—'}`}
                        {mapping.__signaled && (
                          <span className={`ml-2 font-medium ${normalizeSignal(row[mapping.__signaled]) ? 'text-yellow-700' : 'text-slate-400'}`}>
                            {normalizeSignal(row[mapping.__signaled])
                              ? `★ ${normalizeSignal(row[mapping.__signaled])}`
                              : 'no signal'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParsed}
                disabled={!rawText.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
              >
                Next — Map columns →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  {parsed.rows.length} programs ready to import
                </span>
                <button
                  type="button"
                  onClick={handleImport}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Import programs
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
