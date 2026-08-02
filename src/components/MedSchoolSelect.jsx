import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  getMedicalSchoolLabel,
  MED_SCHOOL_OTHER_IMG,
  MED_SCHOOL_OTHER_PAK,
  PAK_MEDICAL_SCHOOL_GROUPS,
} from '../constants/pakMedicalSchools'

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

function buildOptions(includeOtherImg) {
  const rows = []
  for (const group of PAK_MEDICAL_SCHOOL_GROUPS) {
    for (const school of group.schools) {
      rows.push({ ...school, province: group.province })
    }
  }
  rows.push({ ...MED_SCHOOL_OTHER_PAK, province: 'Other' })
  if (includeOtherImg) {
    rows.push({ ...MED_SCHOOL_OTHER_IMG, province: 'Other' })
  }
  return rows
}

function matchesQuery(school, query) {
  if (!query) return true
  const q = query.toLowerCase().trim()
  return (
    school.label.toLowerCase().includes(q) ||
    school.value.toLowerCase().includes(q) ||
    (school.province && school.province.toLowerCase().includes(q))
  )
}

/**
 * Searchable medical school picker.
 * Keeps select-like API: onChange({ target: { value } }) for existing callers.
 */
export default function MedSchoolSelect({
  value,
  onChange,
  includeOtherImg = false,
  className = INPUT_CLASS,
  id,
  name,
}) {
  const listId = useId()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const allOptions = useMemo(() => buildOptions(includeOtherImg), [includeOtherImg])
  const selectedLabel = value ? getMedicalSchoolLabel(value) : ''

  const filtered = useMemo(() => {
    const q = open ? query : ''
    return allOptions.filter((s) => matchesQuery(s, q))
  }, [allOptions, open, query])

  // Sync typed query when value changes from outside (and when closed)
  useEffect(() => {
    if (!open) setQuery(selectedLabel)
  }, [selectedLabel, open])

  useEffect(() => {
    setHighlight(0)
  }, [query, open])

  useEffect(() => {
    function onDocPointer(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false)
        setQuery(selectedLabel)
      }
    }
    document.addEventListener('mousedown', onDocPointer)
    document.addEventListener('touchstart', onDocPointer)
    return () => {
      document.removeEventListener('mousedown', onDocPointer)
      document.removeEventListener('touchstart', onDocPointer)
    }
  }, [selectedLabel])

  function emit(nextValue) {
    onChange?.({ target: { value: nextValue, name: name || undefined } })
  }

  function selectSchool(school) {
    emit(school.value)
    setQuery(school.label)
    setOpen(false)
  }

  function clear() {
    emit('')
    setQuery('')
    setOpen(true)
    inputRef.current?.focus()
  }

  function onInputChange(e) {
    const next = e.target.value
    setQuery(next)
    setOpen(true)
    // If user clears the box, clear selection
    if (!next.trim() && value) emit('')
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault()
        selectSchool(filtered[highlight])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery(selectedLabel)
    }
  }

  // Group filtered results for display
  const grouped = useMemo(() => {
    const map = new Map()
    for (const school of filtered) {
      const key = school.province || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(school)
    }
    return [...map.entries()]
  }, [filtered])

  let flatIndex = -1

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Type to search your medical school…"
          value={query}
          onChange={onInputChange}
          onFocus={() => {
            setOpen(true)
            if (selectedLabel && query === selectedLabel) setQuery('')
          }}
          onKeyDown={onKeyDown}
          className={`${className} pr-16`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              tabIndex={-1}
              className="pointer-events-auto rounded px-1.5 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear medical school"
              onClick={clear}
            >
              ✕
            </button>
          ) : null}
          <span className="text-slate-400" aria-hidden="true">▾</span>
        </div>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              No schools match “{query}”. Try another spelling, or choose Other Pakistani medical school.
            </li>
          ) : (
            grouped.map(([province, schools]) => (
              <li key={province} role="presentation">
                <div className="sticky top-0 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  {province}
                </div>
                <ul role="group" aria-label={province}>
                  {schools.map((school) => {
                    flatIndex += 1
                    const idx = flatIndex
                    const active = idx === highlight
                    const selected = school.value === value
                    return (
                      <li key={school.value} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-left text-sm ${
                            active
                              ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100'
                              : selected
                                ? 'bg-slate-50 text-slate-900 dark:bg-slate-700/50 dark:text-slate-100'
                                : 'text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/40'
                          }`}
                          onMouseEnter={() => setHighlight(idx)}
                          onClick={() => selectSchool(school)}
                        >
                          {school.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
