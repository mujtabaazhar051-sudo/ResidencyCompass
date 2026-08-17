import { useMemo, useState } from 'react'
import { TIER_ORDER } from '../scoring/engine'
import ProgramCard from './ProgramCard'
import { CARD_MODE_KEY } from '../utils/tierSummary'

const TIER_HEADER_STYLES = {
  TARGET:      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200',
  LIKELY:      'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  REACH:       'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
  'LONG SHOT': 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export default function ProgramList({ programs, filters, signals, onSignal, goldUsed = 0, silverUsed = 0, connections, onConnection, notes, onNoteChange, rotations = [], statuses = {}, onStatusChange, compareList = [], onToggleCompare, compareMax = 3, shortlist = {}, onToggleShortlist, userStep2 = '', profileActive = false, onOpenProfile }) {
  const [collapsedTiers, setCollapsedTiers] = useState({})
  const [cardMode, setCardMode] = useState(() => {
    try {
      return localStorage.getItem(CARD_MODE_KEY) || 'simple'
    } catch {
      return 'simple'
    }
  })

  function updateCardMode(mode) {
    setCardMode(mode)
    try {
      localStorage.setItem(CARD_MODE_KEY, mode)
    } catch {}
  }

  const filtered = useMemo(() => {
    let result = [...programs]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.program_name || '').toLowerCase().includes(q) ||
          (p.state || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q) ||
          (p.program_type || '').toLowerCase().includes(q)
      )
    }
    if (filters.tier !== 'all') {
      result = result.filter((p) => p.computed_tier === filters.tier)
    }
    if (filters.state !== 'all') {
      result = result.filter((p) => p.state === filters.state)
    } else if (filters.region && filters.region !== 'all') {
      result = result.filter((p) => p.region === filters.region)
    }
    if (filters.connectionsOnly) {
      result = result.filter((p) => p.user_has_connection)
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter((p) => (statuses[p.program_code] || 'not_applied') === filters.status)
    }
    if (filters.shortlistOnly) {
      result = result.filter((p) => shortlist[p.program_code])
    }

    // No sort here — order comes from App.jsx (stable, profile-driven)
    return result
  }, [programs, filters, statuses, shortlist])

  const grouped = useMemo(() => {
    const groups = {}
    for (const tier of TIER_ORDER) {
      // Group by stable tier so cards don't jump sections when
      // connections/signals change mid-interaction
      groups[tier] = filtered.filter(
        (p) => (p.computed_stable_tier ?? p.computed_tier) === tier,
      )
    }
    return groups
  }, [filtered])

  function toggleTier(tier) {
    setCollapsedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }))
  }

  if (filtered.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
        <p className="text-slate-600 dark:text-slate-300">No programs match your current filters.</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {filters.shortlistOnly
            ? 'Add programs with ☆ Shortlist on any card, or turn off the shortlist filter.'
            : 'Try adjusting your visa need, search query, or tier filter.'}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {!profileActive && (
          <div className="min-w-0 flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {programs.length} programs · sorted alphabetically until you rank them.
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter your Step 2 score on the Profile tab — programs will rank automatically.
            </p>
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Go to Profile tab
              </button>
            )}
          </div>
        )}

        <div className={`flex shrink-0 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700 ${profileActive ? 'ml-auto' : ''}`}>
          {[
            { id: 'simple', label: 'Simple cards' },
            { id: 'advanced', label: 'Advanced' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateCardMode(opt.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                cardMode === opt.id
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div id="program-list">
      {TIER_ORDER.map((tier) => {
        const tierPrograms = grouped[tier]
        if (tierPrograms.length === 0) return null
        const collapsed = collapsedTiers[tier]

        return (
          <div
            key={tier}
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <button
              type="button"
              onClick={() => toggleTier(tier)}
              className={`flex w-full items-center justify-between border-b px-5 py-3.5 text-left font-semibold ${TIER_HEADER_STYLES[tier]}`}
            >
              <span>
                {tier}{' '}
                <span className="font-normal opacity-75">({tierPrograms.length})</span>
              </span>
              <span className="text-sm">{collapsed ? '▼' : '▲'}</span>
            </button>
            {!collapsed && (
              <div className="space-y-4 p-4 md:space-y-5 md:p-5">
                {tierPrograms.map((program) => (
                  <ProgramCard
                    key={program.program_code}
                    program={program}
                    signal={signals[program.program_code] || null}
                    onSignal={(value) => onSignal(program.program_code, value)}
                    goldUsed={goldUsed}
                    silverUsed={silverUsed}
                    connection={connections[program.program_code] || null}
                    onConnection={(value) => onConnection(program.program_code, value)}
                    note={notes?.[program.program_code] || ''}
                    onNoteChange={(text) => onNoteChange(program.program_code, text)}
                    hasRotation={rotations.some((r) => r.programCode === program.program_code)}
                    status={statuses[program.program_code] || 'not_applied'}
                    onStatusChange={(value) => onStatusChange(program.program_code, value)}
                    inCompare={compareList.includes(program.program_code)}
                    onToggleCompare={() => onToggleCompare(program.program_code)}
                    compareDisabled={compareList.length >= compareMax && !compareList.includes(program.program_code)}
                    isShortlisted={Boolean(shortlist[program.program_code])}
                    onToggleShortlist={() => onToggleShortlist(program.program_code)}
                    userStep2={userStep2}
                    profileActive={profileActive}
                    cardMode={cardMode}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
      </div>
    </section>
  )
}
