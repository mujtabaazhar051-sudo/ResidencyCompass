import { APP_STATUSES } from './ProgramCard'

const STATUS_LABELS = Object.fromEntries(
  APP_STATUSES.filter((s) => s.value !== 'not_applied').map((s) => [
    s.value,
    s.label.replace(' ✓', '').replace('🎉 ', ''),
  ]),
)

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 pl-2.5 pr-1 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full px-1 leading-none opacity-70 hover:bg-blue-200/60 hover:opacity-100 dark:hover:bg-blue-800/60"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </span>
  )
}

export default function FilterChips({ filters, onChange, shortlistCount = 0 }) {
  const chips = []

  if (filters.search?.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${filters.search.trim()}"`,
      remove: () => onChange({ ...filters, search: '' }),
    })
  }
  if (filters.state !== 'all') {
    chips.push({
      key: 'state',
      label: `State: ${filters.state}`,
      remove: () => onChange({ ...filters, state: 'all' }),
    })
  }
  if (filters.region && filters.region !== 'all') {
    chips.push({
      key: 'region',
      label: `Region: ${filters.region}`,
      remove: () => onChange({ ...filters, region: 'all' }),
    })
  }
  if (filters.tier !== 'all') {
    chips.push({
      key: 'tier',
      label: `Tier: ${filters.tier}`,
      remove: () => onChange({ ...filters, tier: 'all' }),
    })
  }
  if (filters.status !== 'all') {
    chips.push({
      key: 'status',
      label: STATUS_LABELS[filters.status] || filters.status,
      remove: () => onChange({ ...filters, status: 'all' }),
    })
  }
  if (filters.connectionsOnly) {
    chips.push({
      key: 'connections',
      label: 'Connections only',
      remove: () => onChange({ ...filters, connectionsOnly: false }),
    })
  }
  if (filters.shortlistOnly) {
    chips.push({
      key: 'shortlist',
      label: `Shortlist${shortlistCount > 0 ? ` (${shortlistCount})` : ''}`,
      remove: () => onChange({ ...filters, shortlistOnly: false }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active filters:</span>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onRemove={chip.remove} />
      ))}
      <button
        type="button"
        onClick={() =>
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
        className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
      >
        Clear all
      </button>
    </div>
  )
}
