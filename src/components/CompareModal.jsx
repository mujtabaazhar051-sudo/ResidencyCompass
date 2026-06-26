import { useEffect } from 'react'

const TIER_COLORS = {
  TARGET:      'text-emerald-700 font-bold',
  LIKELY:      'text-blue-700 font-bold',
  REACH:       'text-amber-700 font-bold',
  'LONG SHOT': 'text-slate-600 font-bold',
}

const STATUS_LABELS = {
  applied:     'Applied',
  ii_received: 'II Received ✓',
  declined:    'Declined',
  waitlisted:  'Waitlisted',
  matched:     '🎉 Matched',
}

const BREAKDOWN_LABELS = {
  connection:  'Connection',
  dowPak:      'Dow/Pak Match',
  step2:       'Step 2 Fit',
  step3:       'Step 3',
  ecfmg:       'ECFMG',
  visaStatus:  'Visa Status',
  yogGap:      'YOG Gap',
  rotations:   'US Rotations',
  research:    'Research',
  programType: 'Program Type',
  signal:      'Signal',
  penalty:     'Penalty',
}

function Cell({ children, highlight = false, className = '' }) {
  return (
    <td className={`border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${className}`}>
      {children ?? <span className="text-slate-400 dark:text-slate-500">—</span>}
    </td>
  )
}

function Row({ label, programs, getValue, highlight }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-800 dark:even:bg-slate-800/60">
      <td className="border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 whitespace-nowrap dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
        {label}
      </td>
      {programs.map((p, i) => (
        <Cell key={p.program_code} highlight={highlight === i}>
          {getValue(p)}
        </Cell>
      ))}
    </tr>
  )
}

export default function CompareModal({ programs, signals, connections, statuses, notes, onClose }) {
  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Highlight the program with the best score
  const bestIdx = programs.reduce((best, p, i) => p.computed_score > programs[best].computed_score ? i : best, 0)

  const scoreKeys = programs[0]?.score_breakdown ? Object.keys(programs[0].score_breakdown) : []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-800">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Program Comparison</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Side-by-side breakdown for {programs.length} programs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-36" />
              {programs.map((p) => <col key={p.program_code} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400">Field</th>
                {programs.map((p, i) => (
                  <th
                    key={p.program_code}
                    className={`border border-slate-200 px-3 py-2 text-left text-sm font-semibold dark:border-slate-600 ${
                      i === bestIdx
                        ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200'
                        : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <span className="block leading-snug">{p.program_name}</span>
                    <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{p.state} · {p.program_type}</span>
                    {i === bestIdx && (
                      <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        ★ Best match
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* ── Core stats ── */}
              <tr className="bg-slate-100 dark:bg-slate-700">
                <td colSpan={programs.length + 1} className="border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  Score &amp; Tier
                </td>
              </tr>
              <Row label="Tier"  programs={programs} getValue={(p) => <span className={TIER_COLORS[p.computed_tier]}>{p.computed_tier}</span>} highlight={bestIdx} />
              <Row label="Score" programs={programs} getValue={(p) => (
                <div className="flex items-center gap-2">
                  <span className="font-bold">{p.computed_score}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, p.computed_score)}%` }} />
                  </div>
                </div>
              )} highlight={bestIdx} />

              {/* ── Program info ── */}
              <tr className="bg-slate-100 dark:bg-slate-700">
                <td colSpan={programs.length + 1} className="border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  Program Info
                </td>
              </tr>
              <Row label="State"        programs={programs} getValue={(p) => p.state} />
              <Row label="Program Type" programs={programs} getValue={(p) => p.program_type} />
              <Row label="Visa"         programs={programs} getValue={(p) => p.visa_type} />
              <Row label="Positions"    programs={programs} getValue={(p) => p.pgy_positions} />
              <Row label="Median Step 2" programs={programs} getValue={(p) => p.median_step2 ? <span className="font-semibold">{p.median_step2}</span> : null} />
              <Row label="Dow Matched"  programs={programs} getValue={(p) => p.dow_matched  ? '✓ Yes' : '—'} />
              <Row label="Pak Matched"  programs={programs} getValue={(p) => p.pak_matched  ? '✓ Yes' : '—'} />

              {/* ── Your data ── */}
              <tr className="bg-slate-100 dark:bg-slate-700">
                <td colSpan={programs.length + 1} className="border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  Your Data
                </td>
              </tr>
              <Row label="Signal"     programs={programs} getValue={(p) => signals[p.program_code] ? <span className={signals[p.program_code] === 'gold' ? 'text-yellow-700 font-semibold' : 'text-slate-600 font-semibold'}>{signals[p.program_code] === 'gold' ? '★ Gold' : '☆ Silver'}</span> : null} />
              <Row label="Connection" programs={programs} getValue={(p) => connections[p.program_code]?.strength ?? null} />
              <Row label="Status"     programs={programs} getValue={(p) => STATUS_LABELS[statuses[p.program_code]] ?? null} />
              <Row label="Notes"      programs={programs} getValue={(p) => notes[p.program_code] ? <span className="text-xs text-slate-600 line-clamp-3">{notes[p.program_code]}</span> : null} />

              {/* ── Score breakdown ── */}
              <tr className="bg-slate-100 dark:bg-slate-700">
                <td colSpan={programs.length + 1} className="border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  Score Breakdown
                </td>
              </tr>
              {scoreKeys.map((key) => (
                <Row
                  key={key}
                  label={BREAKDOWN_LABELS[key] ?? key}
                  programs={programs}
                  getValue={(p) => {
                    const s = p.score_breakdown?.[key]?.score ?? 0
                    return s !== 0
                      ? <span className={s > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>{s > 0 ? `+${s}` : s}</span>
                      : <span className="text-slate-400">0</span>
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
