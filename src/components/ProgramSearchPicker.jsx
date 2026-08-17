import { useEffect, useMemo, useRef, useState } from 'react'
import { sortProgramsByName } from '../utils/sortPrograms'

export const UNLISTED_PROGRAM_CODE = '__unlisted__'

const US_STATES = [
  { code: 'AL', label: 'Alabama' }, { code: 'AK', label: 'Alaska' }, { code: 'AZ', label: 'Arizona' },
  { code: 'AR', label: 'Arkansas' }, { code: 'CA', label: 'California' }, { code: 'CO', label: 'Colorado' },
  { code: 'CT', label: 'Connecticut' }, { code: 'DC', label: 'Washington DC' }, { code: 'DE', label: 'Delaware' },
  { code: 'FL', label: 'Florida' }, { code: 'GA', label: 'Georgia' }, { code: 'HI', label: 'Hawaii' },
  { code: 'ID', label: 'Idaho' }, { code: 'IL', label: 'Illinois' }, { code: 'IN', label: 'Indiana' },
  { code: 'IA', label: 'Iowa' }, { code: 'KS', label: 'Kansas' }, { code: 'KY', label: 'Kentucky' },
  { code: 'LA', label: 'Louisiana' }, { code: 'ME', label: 'Maine' }, { code: 'MD', label: 'Maryland' },
  { code: 'MA', label: 'Massachusetts' }, { code: 'MI', label: 'Michigan' }, { code: 'MN', label: 'Minnesota' },
  { code: 'MS', label: 'Mississippi' }, { code: 'MO', label: 'Missouri' }, { code: 'MT', label: 'Montana' },
  { code: 'NE', label: 'Nebraska' }, { code: 'NV', label: 'Nevada' }, { code: 'NH', label: 'New Hampshire' },
  { code: 'NJ', label: 'New Jersey' }, { code: 'NM', label: 'New Mexico' }, { code: 'NY', label: 'New York' },
  { code: 'NC', label: 'North Carolina' }, { code: 'ND', label: 'North Dakota' }, { code: 'OH', label: 'Ohio' },
  { code: 'OK', label: 'Oklahoma' }, { code: 'OR', label: 'Oregon' }, { code: 'PA', label: 'Pennsylvania' },
  { code: 'RI', label: 'Rhode Island' }, { code: 'SC', label: 'South Carolina' }, { code: 'SD', label: 'South Dakota' },
  { code: 'TN', label: 'Tennessee' }, { code: 'TX', label: 'Texas' }, { code: 'UT', label: 'Utah' },
  { code: 'VT', label: 'Vermont' }, { code: 'VA', label: 'Virginia' }, { code: 'WA', label: 'Washington' },
  { code: 'WV', label: 'West Virginia' }, { code: 'WI', label: 'Wisconsin' }, { code: 'WY', label: 'Wyoming' },
]

const MAX_RESULTS = 40

function programMatchesQuery(program, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    (program.program_name || '').toLowerCase().includes(q) ||
    (program.state || '').toLowerCase().includes(q) ||
    (program.program_code || '').includes(q)
  )
}

export default function ProgramSearchPicker({
  programs,
  value,
  onChange,
  unlisted,
  onUnlistedChange,
  onSwitchToReport,
  required = true,
}) {
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const sorted = useMemo(() => sortProgramsByName(programs), [programs])
  const selected = value && value !== UNLISTED_PROGRAM_CODE
    ? sorted.find((p) => p.program_code === value)
    : null
  const isUnlisted = value === UNLISTED_PROGRAM_CODE

  const filtered = useMemo(() => {
    const matches = sorted.filter((p) => programMatchesQuery(p, query))
    return matches.slice(0, MAX_RESULTS)
  }, [sorted, query])

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function selectProgram(program) {
    onChange(program.program_code)
    setQuery('')
    setOpen(false)
  }

  function selectUnlisted() {
    onChange(UNLISTED_PROGRAM_CODE)
    setQuery('')
    setOpen(false)
  }

  function clearSelection() {
    onChange('')
    onUnlistedChange?.({ custom_program_name: '', custom_program_state: '', custom_nrmp_code: '' })
    setQuery('')
  }

  return (
    <div ref={rootRef} className="block md:col-span-2">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Program {required && <span className="text-red-500">*</span>}
      </span>

      {selected && !open && (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/40">
          <div className="min-w-0 text-sm">
            <p className="font-medium text-slate-900 dark:text-slate-100">{selected.program_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selected.state} · NRMP {selected.program_code}</p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Change
          </button>
        </div>
      )}

      {isUnlisted && !open && (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Program not in list — enter details below</p>
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400"
          >
            Change
          </button>
        </div>
      )}

      {(!selected && !isUnlisted) || open ? (
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search by program name, state, or NRMP code…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            autoComplete="off"
          />
          {open && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
              {filtered.length === 0 && query.trim() && (
                <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No matches — try another name or pick “not listed” below.</li>
              )}
              {filtered.map((p) => (
                <li key={p.program_code}>
                  <button
                    type="button"
                    onClick={() => selectProgram(p)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">{p.program_name}</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{p.state}</span>
                  </button>
                </li>
              ))}
              {!query.trim() && sorted.length > MAX_RESULTS && (
                <li className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-700">
                  Type to search {sorted.length} programs…
                </li>
              )}
              <li className="border-t border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={selectUnlisted}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                >
                  My program isn&apos;t in this list
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}

      {isUnlisted && (
        <div className="mt-3 grid gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Program name <span className="text-red-500">*</span></span>
            <input
              type="text"
              required
              value={unlisted?.custom_program_name ?? ''}
              onChange={(e) => onUnlistedChange?.({ ...unlisted, custom_program_name: e.target.value })}
              placeholder="e.g. University of X Internal Medicine"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">State <span className="text-red-500">*</span></span>
            <select
              required
              value={unlisted?.custom_program_state ?? ''}
              onChange={(e) => onUnlistedChange?.({ ...unlisted, custom_program_state: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">— State —</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              NRMP program code <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={unlisted?.custom_nrmp_code ?? ''}
              onChange={(e) => onUnlistedChange?.({ ...unlisted, custom_nrmp_code: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit code if known"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>
        </div>
      )}

      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Search by hospital name, city, state, or NRMP code. Still can&apos;t find it? Choose{' '}
        <span className="font-medium text-slate-600 dark:text-slate-300">My program isn&apos;t in this list</span>
        {onSwitchToReport && (
          <>
            {' '}or{' '}
            <button
              type="button"
              onClick={onSwitchToReport}
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ask us to add it (Error / Question tab)
            </button>
          </>
        )}
        .
      </p>
    </div>
  )
}
