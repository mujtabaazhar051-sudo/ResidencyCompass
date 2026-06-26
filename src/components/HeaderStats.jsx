import { SIGNAL_MAX, SIGNAL_MAX_GOLD, SIGNAL_MAX_SILVER } from '../scoring/engine'

function Divider() {
  return <span className="mx-0.5 hidden h-4 w-px shrink-0 bg-slate-200 sm:block dark:bg-slate-600" aria-hidden="true" />
}

function StatChip({ label, value, title, tone = 'neutral' }) {
  const tones = {
    gold:    'border-yellow-300/80 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/25 dark:text-yellow-200',
    silver:  'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
    rose:    'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/25 dark:text-rose-200',
    violet:  'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-900/25 dark:text-violet-200',
    blue:    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/25 dark:text-blue-200',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-200',
    amber:   'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/25 dark:text-amber-200',
    red:     'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/25 dark:text-rose-200',
    green:   'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900/25 dark:text-green-200',
    neutral: 'border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
    muted:   'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium ${tones[tone] ?? tones.neutral}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </span>
  )
}

export default function HeaderStats({
  goldUsed,
  silverUsed,
  signalsUsed,
  shortlistCount = 0,
  connectionCount = 0,
  statusCounts = {},
}) {
  const goldFull = goldUsed >= SIGNAL_MAX_GOLD
  const silverFull = silverUsed >= SIGNAL_MAX_SILVER
  const signalsFull = signalsUsed >= SIGNAL_MAX

  const applied = statusCounts.applied || 0
  const ii = statusCounts.ii_received || 0
  const waitlisted = statusCounts.waitlisted || 0
  const declined = statusCounts.declined || 0
  const matched = statusCounts.matched || 0
  const hasAppStats = applied + ii + waitlisted + declined + matched > 0

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2"
      aria-label="Application summary"
    >
      <StatChip
        label="Gold"
        value={`${goldUsed}/${SIGNAL_MAX_GOLD}`}
        tone={goldFull ? 'gold' : goldUsed > 0 ? 'gold' : 'muted'}
        title={`Gold signals used (${SIGNAL_MAX_GOLD} max)`}
      />
      <StatChip
        label="Silver"
        value={`${silverUsed}/${SIGNAL_MAX_SILVER}`}
        tone={silverFull ? 'silver' : silverUsed > 0 ? 'silver' : 'muted'}
        title={`Silver signals used (${SIGNAL_MAX_SILVER} max)`}
      />
      <StatChip
        label="Total"
        value={`${signalsUsed}/${SIGNAL_MAX}`}
        tone={signalsFull ? 'amber' : signalsUsed > 0 ? 'neutral' : 'muted'}
        title={`Total signals (${SIGNAL_MAX} max across gold + silver)`}
      />

      <Divider />

      <StatChip
        label="Shortlist"
        value={shortlistCount}
        tone={shortlistCount > 0 ? 'rose' : 'muted'}
        title="Programs on your shortlist"
      />
      <StatChip
        label="Connections"
        value={connectionCount}
        tone={connectionCount > 0 ? 'violet' : 'muted'}
        title="Programs where you marked a connection"
      />

      {hasAppStats && (
        <>
          <Divider />
          {applied > 0 && (
            <StatChip label="Applied" value={applied} tone="blue" title="Programs marked as applied" />
          )}
          {ii > 0 && (
            <StatChip label="Interview Invites" value={ii} tone="emerald" title="Programs where you received an interview invite" />
          )}
          {waitlisted > 0 && (
            <StatChip label="Waitlisted" value={waitlisted} tone="amber" title="Programs where you are waitlisted" />
          )}
          {declined > 0 && (
            <StatChip label="Declined" value={declined} tone="red" title="Programs that declined your application" />
          )}
          {matched > 0 && (
            <StatChip label="Matched" value={matched} tone="green" title="Programs where you matched" />
          )}
        </>
      )}
    </div>
  )
}
