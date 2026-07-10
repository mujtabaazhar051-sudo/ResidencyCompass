import { ERAS_REGIONS, MAX_ERAS_REGIONS, normalizeErasRegions } from '../constants/erasRegions'

export default function ErasRegionPicker({ value = [], onChange, max = MAX_ERAS_REGIONS }) {
  const selected = normalizeErasRegions(value)
  const atMax = selected.length >= max

  function toggle(region) {
    if (selected.includes(region)) {
      onChange(selected.filter((r) => r !== region))
    } else if (selected.length < max) {
      onChange([...selected, region])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ERAS_REGIONS.map((region) => {
          const isOn = selected.includes(region.value)
          const disabled = !isOn && atMax
          return (
            <button
              key={region.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(region.value)}
              title={region.value}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isOn
                  ? 'border-blue-500 bg-blue-50 font-semibold text-blue-800 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-200'
                  : disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
              }`}
            >
              <span className="block sm:hidden">{region.short}</span>
              <span className="hidden sm:block">{region.value}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {selected.length} / {max} selected
        {selected.length > 0 && (
          <span className="text-slate-400 dark:text-slate-500">
            {' '}
            — programs in these regions get a moderate score boost
          </span>
        )}
      </p>
    </div>
  )
}
