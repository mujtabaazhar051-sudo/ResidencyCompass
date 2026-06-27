import { useState } from 'react'
import { SIGNAL_MAX_GOLD, SIGNAL_MAX_SILVER } from '../scoring/engine'
import { buildWhyThisTier } from '../utils/tierSummary'
import { isDataStale } from '../utils/dataSources'
import ProgramDataProvenance from './ProgramDataProvenance'

// ─── Tier styles ─────────────────────────────────────────────────────────────

const TIER_STYLES = {
  TARGET:      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
  LIKELY:      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
  REACH:       'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
  'LONG SHOT': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
}

const BTN_IDLE = 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500'
const BTN_LOCKED = 'cursor-not-allowed border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'

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

// ─── Application status ───────────────────────────────────────────────────────

export const APP_STATUSES = [
  { value: 'not_applied', label: '— Status —',    badge: null },
  { value: 'applied',     label: 'Applied',        badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
  { value: 'ii_received', label: 'II Received ✓',  badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' },
  { value: 'declined',    label: 'Declined',        badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700' },
  { value: 'waitlisted',  label: 'Waitlisted',      badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
  { value: 'matched',     label: '🎉 Matched!',     badge: 'bg-green-200 text-green-900 border-green-300 font-bold dark:bg-green-900/40 dark:text-green-300 dark:border-green-700' },
]

const STATUS_MAP = Object.fromEntries(APP_STATUSES.map((s) => [s.value, s]))

function isStale(lastVerified) {
  return isDataStale(lastVerified)
}

function parseStep2(value) {
  const n = parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(n) && n >= 200 && n <= 300 ? n : null
}

function Step2VsMedian({ userStep2, medianStep2 }) {
  const user = parseStep2(userStep2)
  const median = parseStep2(medianStep2)

  if (!median) return null

  if (!user) {
    return (
      <span className="text-slate-400">
        · Median Step 2 <span className="font-semibold text-slate-600 dark:text-slate-300">{median}</span>
      </span>
    )
  }

  const diff = user - median
  const atMedian = Math.abs(diff) <= 2

  let label, className
  if (atMedian) {
    label = 'At median'
    className = 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
  } else if (diff > 0) {
    label = `+${diff} above median`
    className = 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
  } else {
    label = `${Math.abs(diff)} below median`
    className = 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
  }

  return (
    <span className="ml-2 inline-flex flex-wrap items-center gap-1.5">
      <span className="text-slate-400">
        · You <span className="font-semibold text-slate-700 dark:text-slate-200">{user}</span>
        {' vs '}
        median <span className="font-semibold text-slate-600 dark:text-slate-300">{median}</span>
      </span>
      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${className}`}>
        {label}
      </span>
    </span>
  )
}

// ─── Signal selector ─────────────────────────────────────────────────────────

function SignalSelector({ signal, onSignal, goldUsed, silverUsed }) {
  // A type is locked if this program doesn't already hold that type AND the cap for that type is full
  const goldLocked   = signal !== 'gold'   && goldUsed   >= SIGNAL_MAX_GOLD
  const silverLocked = signal !== 'silver' && silverUsed >= SIGNAL_MAX_SILVER

  function handleClick(value) {
    onSignal(signal === value ? null : value)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => handleClick('gold')}
        disabled={goldLocked}
        title={goldLocked ? `Gold cap reached (${SIGNAL_MAX_GOLD} max)` : `Gold signal (${goldUsed}/${SIGNAL_MAX_GOLD} used)`}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all
          ${signal === 'gold'
            ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-sm ring-1 ring-yellow-400'
            : goldLocked
            ? BTN_LOCKED
            : `${BTN_IDLE} hover:border-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-400`}`}
      >
        ★ Gold
      </button>
      <button
        type="button"
        onClick={() => handleClick('silver')}
        disabled={silverLocked}
        title={silverLocked ? `Silver cap reached (${SIGNAL_MAX_SILVER} max)` : `Silver signal (${silverUsed}/${SIGNAL_MAX_SILVER} used)`}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all
          ${signal === 'silver'
            ? 'bg-slate-500 border-slate-600 text-white shadow-sm ring-1 ring-slate-400'
            : silverLocked
            ? BTN_LOCKED
            : `${BTN_IDLE} hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-300`}`}
      >
        ☆ Silver
      </button>
      {signal && (
        <button type="button" onClick={() => onSignal(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Remove signal">✕</button>
      )}
    </div>
  )
}

// ─── Connection selector ──────────────────────────────────────────────────────

const CONN_STRENGTH_OPTIONS = [
  {
    value: 'weak',
    label: 'Weak',
    help: 'Peripheral / second-degree connection',
    active: 'bg-orange-400 border-orange-500 text-white shadow-sm ring-1 ring-orange-300',
    idle:   `${BTN_IDLE} hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400`,
  },
  {
    value: 'moderate',
    label: 'Moderate',
    help: 'Met them, exchanged emails',
    active: 'bg-blue-500 border-blue-600 text-white shadow-sm ring-1 ring-blue-300',
    idle:   `${BTN_IDLE} hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400`,
  },
  {
    value: 'strong',
    label: 'Strong',
    help: 'Direct mentor, PD, close faculty',
    active: 'bg-violet-500 border-violet-600 text-white shadow-sm ring-1 ring-violet-300',
    idle:   `${BTN_IDLE} hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400`,
  },
]

function ConnectionSelector({ connection, onConnection }) {
  const strength = connection?.strength || null
  const count    = connection?.count    || 1

  function setStrength(val) {
    if (strength === val) {
      onConnection(null)
    } else {
      onConnection({ strength: val, count, names: connection?.names || '' })
    }
  }

  function setCount(n) {
    onConnection({ strength, count: n, names: connection?.names || '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CONN_STRENGTH_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setStrength(opt.value)}
          title={opt.help}
          className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors
            ${strength === opt.value ? opt.active : opt.idle}`}
        >
          {opt.label}
        </button>
      ))}

      {strength && (
        <>
          <span className="text-xs text-slate-400">×</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              title={n === 3 ? '3 or more contacts' : `${n} contact${n > 1 ? 's' : ''}`}
              className={`rounded border px-1.5 py-0.5 text-xs font-semibold transition-all
                ${count === n || (n === 3 && count >= 3)
                  ? 'bg-slate-700 border-slate-800 text-white shadow-sm'
                  : `${BTN_IDLE} hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300`}`}
            >
              {n === 3 ? '3+' : n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onConnection(null)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Remove connection"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}

function ControlSection({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{children}</div>
    </div>
  )
}

function TierScoreRow({ program }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${TIER_STYLES[program.computed_tier]}`}>
        {program.computed_tier}
      </span>
      <div className="w-28 sm:w-32">
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Score</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{program.computed_score}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${program.computed_score}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ShortlistButton({ isShortlisted, onToggleShortlist }) {
  return (
    <button
      type="button"
      onClick={onToggleShortlist}
      title={isShortlisted ? 'Remove from shortlist' : 'Add to apply shortlist'}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        isShortlisted
          ? 'border-rose-400 bg-rose-100 text-rose-800 hover:bg-rose-200 dark:border-rose-600 dark:bg-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-900/60'
          : 'border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-700 dark:hover:bg-rose-900/20 dark:hover:text-rose-300'
      }`}
    >
      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
    </button>
  )
}

function CompareButton({ inCompare, compareDisabled, onToggleCompare }) {
  return (
    <button
      type="button"
      onClick={onToggleCompare}
      disabled={compareDisabled}
      title={inCompare ? 'Remove from comparison' : compareDisabled ? 'Max 3 programs' : 'Add to comparison'}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        inCompare
          ? 'border-blue-400 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:border-blue-500 dark:bg-blue-900/40 dark:text-blue-200'
          : compareDisabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
          : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
      }`}
    >
      {inCompare ? 'In compare' : 'Compare'}
    </button>
  )
}

function CardChevron({ expanded }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
    >
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
    </svg>
  )
}

function ExpandablePanel({ expanded, children }) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
      aria-hidden={!expanded}
    >
      <div className="overflow-hidden">
        <div
          className={`min-h-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
            expanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function StatusSelect({ status, statusInfo, onStatusChange }) {
  return (
    <select
      value={status || 'not_applied'}
      onChange={(e) => onStatusChange(e.target.value)}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 ${
        statusInfo.badge
          ? `${statusInfo.badge} cursor-pointer`
          : 'border-slate-200 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
      }`}
    >
      {APP_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}

function ExpandedDetails({
  program,
  note,
  onNoteChange,
  connection,
  onConnection,
  embedded = false,
}) {
  return (
    <div
      className={
        embedded
          ? 'space-y-5 border-t border-slate-100 pt-5 dark:border-slate-700 md:pt-5'
          : 'space-y-5 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-700 md:px-6 md:pb-6 md:pt-5'
      }
    >
      <div>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            My Notes
            <span className="font-normal text-slate-400">(private — saved in your browser)</span>
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Jot down action items, impressions, follow-ups…"
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </label>
      </div>

      {(program.flags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {program.flags.map((flag) => (
            <span key={flag} className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {flag}
            </span>
          ))}
        </div>
      )}

      {connection?.strength && (
        <div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Connection names <span className="font-normal text-slate-400">(your reference — not used for scoring)</span>
            </span>
            <input
              type="text"
              value={connection.names || ''}
              onChange={(e) => onConnection({ ...connection, names: e.target.value })}
              placeholder="e.g. Dr. Ahmed Khan, Dr. Sarah Mitchell"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </label>
        </div>
      )}

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Score Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-4 font-medium">Component</th>
                <th className="pb-2 pr-4 font-medium">Score</th>
                <th className="pb-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(program.score_breakdown ?? {}).map(([key, { score, note: rowNote }]) => (
                <tr key={key} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-300">
                    {BREAKDOWN_LABELS[key]}
                  </td>
                  <td className={`whitespace-nowrap py-2.5 pr-4 font-semibold
                    ${score > 0 ? 'text-emerald-700 dark:text-emerald-400' : score < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                    {score > 0 ? `+${score}` : score}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400">{rowNote}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                <td className="pt-2 pr-4 font-bold text-slate-800 dark:text-slate-200">Total</td>
                <td className="pt-2 pr-4 font-bold text-slate-900 dark:text-slate-100">{program.computed_score}</td>
                <td className="pt-2 text-slate-500 dark:text-slate-400">Min 0, no upper cap</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-2 md:gap-5">
        <Detail label="Program Director" value={program.pd_name} />
        <Detail label="Phone" value={program.phone} />
        <Detail label="Email" value={program.email} />
        <Detail
          label="Website"
          value={program.website
            ? <a href={program.website} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 hover:underline dark:text-blue-400">{program.website}</a>
            : null}
        />
        <Detail label="Known Contacts" value={program.known_contacts} />
        <Detail label="Community reports" value={program.crowdsourced_outcomes} />
        <Detail label="Program Notes" value={program.program_notes} className="md:col-span-2" />
        <Detail label="PGY Positions" value={program.pgy_positions} />
        <Detail label="Median Step 2 (crowdsourced)" value={program.median_step2} />
      </div>

      <ProgramDataProvenance program={program} />
    </div>
  )
}

// ─── Main card ───────────────────────────────────────────────────────────────

export default function ProgramCard({
  program,
  signal,
  onSignal,
  goldUsed = 0,
  silverUsed = 0,
  connection,
  onConnection,
  note,
  onNoteChange,
  hasRotation = false,
  status,
  onStatusChange,
  inCompare = false,
  onToggleCompare,
  compareDisabled = false,
  isShortlisted = false,
  onToggleShortlist,
  userStep2 = '',
  profileActive = false,
  cardMode = 'simple',
}) {
  const [expanded, setExpanded] = useState(false)
  const stale = isStale(program.last_verified)
  const hasNote = Boolean(note?.trim())
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP['not_applied']
  const whyTier = profileActive ? buildWhyThisTier(program.score_breakdown) : null

  const nameBadges = (
    <>
      {stale && (
        <span title="Last curator check was over 2 years ago — verify on the program website" className="text-sm text-amber-500">May be outdated</span>
      )}
      {program.user_has_connection && (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          Known pipeline
        </span>
      )}
      {hasRotation && (
        <span title="You have a rotation at this program" className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
          Rotation
        </span>
      )}
      {hasNote && (
        <span title="You have a note for this program" className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          Note
        </span>
      )}
      {isShortlisted && (
        <span title="On your apply shortlist" className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          Shortlist
        </span>
      )}
      {statusInfo.badge && (
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusInfo.badge}`}>
          {statusInfo.label}
        </span>
      )}
    </>
  )

  const applicationControls = (
    <>
      <StatusSelect status={status} statusInfo={statusInfo} onStatusChange={onStatusChange} />
      <ShortlistButton isShortlisted={isShortlisted} onToggleShortlist={onToggleShortlist} />
      <CompareButton inCompare={inCompare} compareDisabled={compareDisabled} onToggleCompare={onToggleCompare} />
    </>
  )

  const signalConnectionControls = (
    <>
      <ControlSection label="Signals">
        <SignalSelector signal={signal} onSignal={onSignal} goldUsed={goldUsed} silverUsed={silverUsed} />
      </ControlSection>
      <ControlSection label="Connections">
        <ConnectionSelector connection={connection} onConnection={onConnection} />
      </ControlSection>
    </>
  )

  return (
    <article
      className={`rounded-xl border bg-white shadow-sm transition-[border-color,box-shadow] duration-300 ease-out dark:bg-slate-800 ${
        expanded
          ? 'border-blue-200 shadow-md dark:border-blue-800'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="w-full cursor-pointer px-5 pb-4 pt-5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30 md:px-6 md:pt-6"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 md:text-lg">
                {program.program_name}
              </h3>
              {nameBadges}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {program.state} · {program.program_type} · {program.visa_type}
              <Step2VsMedian userStep2={userStep2} medianStep2={program.median_step2} />
            </p>
            {whyTier && (
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Why this tier: </span>
                {whyTier}
              </p>
            )}
            {!expanded && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Click card for signals, notes, and full breakdown</p>
            )}
          </div>
          <div className="flex shrink-0 items-start gap-2">
            {profileActive && <TierScoreRow program={program} />}
            <CardChevron expanded={expanded} />
          </div>
        </div>
      </button>

      <ExpandablePanel expanded={expanded}>
        <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-700 md:px-6 md:pb-6">
          <ControlSection label="Application">
            {applicationControls}
          </ControlSection>

          {signalConnectionControls}

          <ExpandedDetails
            program={program}
            note={note}
            onNoteChange={onNoteChange}
            connection={connection}
            onConnection={onConnection}
            embedded
          />
        </div>
      </ExpandablePanel>
    </article>
  )
}

function Detail({ label, value, className = '' }) {
  if (!value) return null
  return (
    <div className={className}>
      <dt className="font-medium text-slate-700 dark:text-slate-300">{label}</dt>
      <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">{value}</dd>
    </div>
  )
}
