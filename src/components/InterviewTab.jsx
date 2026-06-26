import { useState } from 'react'

const FORMATS = [
  { value: 'unknown',   label: '— Format TBD —' },
  { value: 'virtual',   label: '🎥 Virtual' },
  { value: 'in_person', label: '🏥 In-Person' },
  { value: 'hybrid',    label: '🔀 Hybrid' },
]

const TIER_STYLES = {
  TARGET:      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  LIKELY:      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  REACH:       'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  'LONG SHOT': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
}

export default function InterviewTab({ programs, statuses, ivDates, onIvDateChange }) {
  const [sortBy, setSortBy] = useState('received')

  const iiPrograms = programs.filter((p) => statuses[p.program_code] === 'ii_received')

  const sorted = [...iiPrograms].sort((a, b) => {
    if (sortBy === 'received') {
      const da = ivDates[a.program_code]?.dateReceived || ''
      const db = ivDates[b.program_code]?.dateReceived || ''
      if (da && db) return da < db ? -1 : da > db ? 1 : 0
      if (da) return -1
      if (db) return 1
      return 0
    }
    if (sortBy === 'interview') {
      const da = ivDates[a.program_code]?.interviewDate || ''
      const db = ivDates[b.program_code]?.interviewDate || ''
      if (da && db) return da < db ? -1 : da > db ? 1 : 0
      if (da) return -1
      if (db) return 1
      return 0
    }
    if (sortBy === 'tier') {
      const order = ['TARGET', 'LIKELY', 'REACH', 'LONG SHOT']
      const td = order.indexOf(a.computed_tier) - order.indexOf(b.computed_tier)
      if (td !== 0) return td
      return b.computed_score - a.computed_score
    }
    return a.program_name.localeCompare(b.program_name)
  })

  function update(code, field, value) {
    onIvDateChange(code, { ...(ivDates[code] || {}), [field]: value })
  }

  // ── Stats ──
  const withReceived  = sorted.filter((p) => ivDates[p.program_code]?.dateReceived).length
  const withInterview = sorted.filter((p) => ivDates[p.program_code]?.interviewDate).length
  const virtual       = sorted.filter((p) => ivDates[p.program_code]?.format === 'virtual').length
  const inPerson      = sorted.filter((p) => ivDates[p.program_code]?.format === 'in_person').length

  if (iiPrograms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 p-12 text-center">
        <div className="mb-3 text-5xl">📬</div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">No interview invites yet</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mark a program as <span className="font-medium text-emerald-600 dark:text-emerald-400">II Received</span> in the Programs tab and it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            Interview Invites
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              {iiPrograms.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track dates and details for each invite</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">Sort:</span>
          {[
            ['received',  '📨 Invite date'],
            ['interview', '📅 Interview date'],
            ['tier',      '🏆 Tier'],
            ['name',      '🔤 Name'],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSortBy(val)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === val
                  ? 'border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat strip */}
      <div className="flex flex-wrap gap-3">
        <Stat value={iiPrograms.length} label="Total IIs" color="slate" />
        {withReceived  > 0 && <Stat value={withReceived}  label="Invite date set"  color="blue" />}
        {withInterview > 0 && <Stat value={withInterview} label="Interview date set" color="emerald" />}
        {virtual       > 0 && <Stat value={virtual}       label="Virtual"           color="violet" />}
        {inPerson      > 0 && <Stat value={inPerson}      label="In-Person"         color="teal" />}
      </div>

      {/* Program rows */}
      <div className="space-y-3">
        {sorted.map((p) => {
          const iv = ivDates[p.program_code] || {}
          const daysUntil = iv.interviewDate
            ? Math.round((new Date(iv.interviewDate) - new Date()) / 86400000)
            : null

          return (
            <div
              key={p.program_code}
              className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold leading-tight text-slate-900 dark:text-slate-100">
                      {p.program_name}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${TIER_STYLES[p.computed_tier]}`}>
                      {p.computed_tier}
                    </span>
                    {daysUntil !== null && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        daysUntil < 0
                          ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          : daysUntil <= 7
                          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)}d ago` : daysUntil === 0 ? 'Today!' : `In ${daysUntil}d`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {p.state} · {p.program_type}
                    {p.median_step2 && (
                      <span className="ml-2">· Median Step 2 <span className="font-semibold text-slate-600 dark:text-slate-300">{p.median_step2}</span></span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.computed_score}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">score</div>
                </div>
              </div>

              {/* Detail inputs */}
              <div className="grid gap-3 px-4 pb-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">📨 Invite received</span>
                  <input
                    type="date"
                    value={iv.dateReceived || ''}
                    onChange={(e) => update(p.program_code, 'dateReceived', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">📅 Interview date</span>
                  <input
                    type="date"
                    value={iv.interviewDate || ''}
                    onChange={(e) => update(p.program_code, 'interviewDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">🎥 Format</span>
                  <select
                    value={iv.format || 'unknown'}
                    onChange={(e) => update(p.program_code, 'format', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  >
                    {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </label>
              </div>

              {/* Notes */}
              <div className="px-4 pb-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">📝 Interview notes</span>
                  <textarea
                    rows={2}
                    value={iv.notes || ''}
                    onChange={(e) => update(p.program_code, 'notes', e.target.value)}
                    placeholder="Interviewers, questions asked, impressions, follow-up needed…"
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  const colors = {
    slate:   'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
    blue:    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    violet:  'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-200',
    teal:    'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
  }
  return (
    <div className={`rounded-lg border px-4 py-2 text-center ${colors[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  )
}
