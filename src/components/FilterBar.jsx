import { useState } from 'react'
import { TIER_ORDER } from '../scoring/engine'
import { APP_STATUSES } from './ProgramCard'
import { FILTERS_COLLAPSE_KEY } from '../utils/profile'

function filterSummary(filters, shortlistCount) {
  const parts = []
  if (filters.search?.trim()) parts.push(`"${filters.search.trim()}"`)
  if (filters.state !== 'all') parts.push(filters.state)
  if (filters.region && filters.region !== 'all') parts.push(filters.region)
  if (filters.tier !== 'all') parts.push(filters.tier)
  if (filters.status !== 'all') {
    const status = APP_STATUSES.find((s) => s.value === filters.status)
    if (status) parts.push(status.label.replace(' ✓', '').replace('🎉 ', ''))
  }
  if (filters.connectionsOnly) parts.push('Connections only')
  if (filters.shortlistOnly) {
    parts.push(`Shortlist${shortlistCount > 0 ? ` (${shortlistCount})` : ''}`)
  }
  return parts.length ? parts.join(' · ') : 'All programs — no filters active'
}

const STATUS_FILTER_STYLES = {
  all:          { active: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',          idle: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600' },
  not_applied:  { active: 'bg-slate-500 text-white',          idle: 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600' },
  applied:      { active: 'bg-blue-600 text-white',           idle: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50' },
  ii_received:  { active: 'bg-emerald-600 text-white',        idle: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50' },
  declined:     { active: 'bg-rose-600 text-white',           idle: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50' },
  waitlisted:   { active: 'bg-amber-500 text-white',          idle: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50' },
  matched:      { active: 'bg-green-600 text-white',          idle: 'bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50' },
}

export default function FilterBar({
  filters,
  onChange,
  states,
  regions = [],
  tierCounts,
  statusCounts = {},
  shortlistCount = 0,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      return localStorage.getItem(FILTERS_COLLAPSE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const isControlled = controlledCollapsed !== undefined
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed

  function setCollapsed(next) {
    if (isControlled) onCollapsedChange?.(next)
    else setInternalCollapsed(next)
    try {
      localStorage.setItem(FILTERS_COLLAPSE_KEY, String(next))
    } catch {}
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed)
  }

  function update(field, value) {
    const next = { ...filters, [field]: value }
    // State and region filters are mutually exclusive
    if (field === 'state' && value !== 'all') next.region = 'all'
    if (field === 'region' && value !== 'all') next.state = 'all'
    onChange(next)
  }

  function clearAll() {
    onChange({
      search: '',
      tier: 'all',
      state: 'all',
      region: 'all',
      status: 'all',
      connectionsOnly: false,
      shortlistOnly: false,
    })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 md:px-6 md:py-4"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
          <p className={`text-sm ${collapsed ? 'truncate text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {collapsed ? filterSummary(filters, shortlistCount) : 'Narrow the program list by tier, status, location, and more'}
          </p>
        </div>
        <span className="shrink-0 text-sm text-slate-400" aria-hidden="true">{collapsed ? '▼' : '▲'}</span>
      </button>

      {!collapsed && (
      <div className="flex flex-col gap-4 border-t border-slate-200 p-4 dark:border-slate-700 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Search programs</span>
            <input
              type="search"
              placeholder="Name, city, state, or type…"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </label>

          <label className="sm:w-40">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">State</span>
            <select
              value={filters.state}
              onChange={(e) => update('state', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="all">All states</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:w-48">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Region</span>
            <select
              value={filters.region || 'all'}
              onChange={(e) => update('region', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="all">All regions</option>
              {regions.map((rg) => (
                <option key={rg} value={rg}>
                  {rg}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear filters
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tier:</span>
          <button
            type="button"
            onClick={() => update('tier', 'all')}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              filters.tier === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          {TIER_ORDER.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => update('tier', tier)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                filters.tier === tier
                  ? tierButtonActive(tier)
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {tier} ({tierCounts[tier] || 0})
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
          {[{ value: 'all', label: 'All' }, ...APP_STATUSES.filter((s) => s.value !== 'not_applied')].map((s) => {
            const style = STATUS_FILTER_STYLES[s.value] ?? STATUS_FILTER_STYLES.all
            const count = s.value === 'all' ? null : statusCounts[s.value]
            const isActive = (filters.status || 'all') === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => update('status', s.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${isActive ? style.active : style.idle}`}
              >
                {s.label}{count != null && count > 0 ? ` (${count})` : ''}
              </button>
            )
          })}
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.connectionsOnly}
            onChange={(e) => update('connectionsOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Show connections only</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.shortlistOnly}
            onChange={(e) => update('shortlistOnly', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Shortlist only{shortlistCount > 0 ? ` (${shortlistCount})` : ''}
          </span>
        </label>
      </div>
      )}
    </section>
  )
}

function tierButtonActive(tier) {
  switch (tier) {
    case 'TARGET':
      return 'bg-emerald-600 text-white'
    case 'LIKELY':
      return 'bg-blue-600 text-white'
    case 'REACH':
      return 'bg-amber-500 text-white'
    case 'LONG SHOT':
      return 'bg-slate-500 text-white'
    default:
      return 'bg-slate-800 text-white'
  }
}
