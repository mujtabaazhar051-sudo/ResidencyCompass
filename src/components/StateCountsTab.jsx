import { useMemo, useState } from 'react'
import { TIER_ORDER } from '../scoring/engine'
import USStateMap, { REGION_FILLS, countFill, tierFill } from './USStateMap'

const STATE_NAMES = {
  AL: 'Alabama', AR: 'Arkansas', AZ: 'Arizona', CA: 'California', CT: 'Connecticut',
  DC: 'District of Columbia', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  IL: 'Illinois', IN: 'Indiana', KS: 'Kansas', LA: 'Louisiana', MA: 'Massachusetts',
  MD: 'Maryland', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri', NC: 'North Carolina',
  NE: 'Nebraska', NJ: 'New Jersey', NM: 'New Mexico', NV: 'Nevada', NY: 'New York',
  OH: 'Ohio', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  TN: 'Tennessee', TX: 'Texas', WI: 'Wisconsin', WV: 'West Virginia',
}

const TIER_BAR_COLORS = {
  TARGET:      'bg-emerald-500',
  LIKELY:      'bg-blue-500',
  REACH:       'bg-amber-400',
  'LONG SHOT': 'bg-slate-400',
}

const TIER_TEXT = {
  TARGET:      'text-emerald-700 dark:text-emerald-400',
  LIKELY:      'text-blue-700 dark:text-blue-400',
  REACH:       'text-amber-700 dark:text-amber-400',
  'LONG SHOT': 'text-slate-600 dark:text-slate-400',
}

const REGION_ORDER = [
  'Middle Atlantic',
  'East North Central',
  'South Atlantic',
  'West South Central',
  'East South Central',
  'New England',
  'West North Central',
  'Mountain',
  'Pacific',
]

function buildCounts(programs, key) {
  const map = {}
  for (const p of programs) {
    const k = p[key]
    if (!k) continue
    if (!map[k]) {
      map[k] = { total: 0, tiers: {}, shortlist: 0 }
    }
    map[k].total += 1
    const tier = p.computed_tier ?? 'LONG SHOT'
    map[k].tiers[tier] = (map[k].tiers[tier] || 0) + 1
  }
  return map
}

function CountBar({ label, sublabel, count, maxCount, tiers, shortlist, onClick }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{label}</span>
          {sublabel && (
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{sublabel}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {shortlist > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              ⭐ {shortlist}
            </span>
          )}
          <span className="text-lg font-bold tabular-nums text-slate-800 dark:text-slate-100">{count}</span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-500 transition-all group-hover:bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>

      {tiers && count > 0 && (
        <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full">
          {TIER_ORDER.map((tier) => {
            const n = tiers[tier] || 0
            if (!n) return null
            return (
              <div
                key={tier}
                className={`${TIER_BAR_COLORS[tier]}`}
                style={{ width: `${(n / count) * 100}%` }}
                title={`${tier}: ${n}`}
              />
            )
          })}
        </div>
      )}

      {tiers && count > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {TIER_ORDER.map((tier) => {
            const n = tiers[tier] || 0
            if (!n) return null
            return (
              <span key={tier} className={TIER_TEXT[tier]}>
                {tier}: {n}
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}

export default function StateCountsTab({
  programs,
  shortlist = {},
  onSelectState,
  onSelectRegion,
  selectedState = null,
  selectedRegion = null,
  isDark = false,
  profileActive = false,
}) {
  const [view, setView] = useState('state') // 'state' | 'region'
  const [sort, setSort] = useState('count') // 'count' | 'alpha'
  const [colorMode, setColorMode] = useState('count') // 'count' | 'tier'

  const stateData = useMemo(() => {
    const counts = buildCounts(programs, 'state')
    for (const p of programs) {
      if (shortlist[p.program_code] && counts[p.state]) {
        counts[p.state].shortlist += 1
      }
    }
    return counts
  }, [programs, shortlist])

  const regionData = useMemo(() => {
    const counts = buildCounts(programs, 'region')
    for (const p of programs) {
      if (shortlist[p.program_code] && counts[p.region]) {
        counts[p.region].shortlist += 1
      }
    }
    return counts
  }, [programs, shortlist])

  const stateToRegion = useMemo(() => {
    const map = {}
    for (const p of programs) {
      if (p.state && p.region) map[p.state] = p.region
    }
    return map
  }, [programs])

  const maxState = useMemo(
    () => Math.max(0, ...Object.values(stateData).map((d) => d.total)),
    [stateData],
  )

  const maxRegion = useMemo(
    () => Math.max(0, ...Object.values(regionData).map((d) => d.total)),
    [regionData],
  )

  const sortedStates = useMemo(() => {
    const entries = Object.entries(stateData)
    if (sort === 'alpha') {
      return entries.sort(([a], [b]) => a.localeCompare(b))
    }
    return entries.sort(([nameA, a], [nameB, b]) => b.total - a.total || nameA.localeCompare(nameB))
  }, [stateData, sort])

  const sortedRegions = useMemo(() => {
    const entries = Object.entries(regionData)
    const order = (name) => {
      const i = REGION_ORDER.indexOf(name)
      return i === -1 ? 999 : i
    }
    if (sort === 'alpha') {
      return entries.sort(([a], [b]) => a.localeCompare(b))
    }
    return entries.sort(([nameA, a], [nameB, b]) => b.total - a.total || order(nameA) - order(nameB))
  }, [regionData, sort])

  const stateCount = Object.keys(stateData).length
  const regionCount = Object.keys(regionData).length

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Geographic overview</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Explore program density on the map, then drill into the list below. Click a state to jump to the Programs tab with that filter applied.
          {profileActive && ' Toggle tier coloring to see where your best-fit programs cluster.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {programs.length} programs
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {stateCount} states
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {regionCount} regions
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {[
            { id: 'state', label: 'By state' },
            { id: 'region', label: 'By region' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setView(opt.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {[
            { id: 'count', label: 'Most programs' },
            { id: 'alpha', label: 'A–Z' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSort(opt.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sort === opt.id
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* US map */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800 md:px-5 md:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {view === 'state' ? 'Programs by state' : 'Programs by region'}
          </h3>
          {view === 'state' && profileActive && (
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              {[
                { id: 'count', label: 'By count' },
                { id: 'tier', label: 'By top tier' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColorMode(opt.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    colorMode === opt.id
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <USStateMap
          stateData={stateData}
          stateToRegion={stateToRegion}
          regionData={regionData}
          view={view}
          colorMode={colorMode}
          maxCount={maxState}
          profileActive={profileActive}
          selectedState={selectedState}
          selectedRegion={selectedRegion}
          isDark={isDark}
          onSelectState={onSelectState}
          onSelectRegion={onSelectRegion}
        />

        {/* Map legend */}
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
          {view === 'state' && colorMode === 'count' && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Program count</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-6 rounded border border-slate-300 dark:border-slate-600"
                  style={{ background: isDark ? '#475569' : '#e2e8f0' }}
                />
                <span>None</span>
              </div>
              <div className="flex h-3 w-32 overflow-hidden rounded border border-slate-300 dark:border-slate-600">
                {[0.15, 0.35, 0.55, 0.75, 1].map((t) => (
                  <span
                    key={t}
                    className="h-full flex-1"
                    style={{ background: countFill(Math.ceil(maxState * t), maxState, isDark) }}
                  />
                ))}
              </div>
              <span>Fewer → More ({maxState} max)</span>
            </div>
          )}

          {view === 'state' && colorMode === 'tier' && profileActive && (
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Dominant tier per state</span>
              {TIER_ORDER.map((tier) => (
                <span key={tier} className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded border border-slate-300 dark:border-slate-600"
                    style={{ background: tierFill(tier, isDark) }}
                  />
                  {tier}
                </span>
              ))}
              <span className="text-slate-400">· Gray = no programs</span>
            </div>
          )}

          {view === 'region' && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Census region</span>
              {Object.entries(REGION_FILLS).map(([name, palette]) => {
                if (!regionData[name]?.total) return null
                return (
                  <span key={name} className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded border border-slate-300 dark:border-slate-600"
                      style={{ background: isDark ? palette.dark : palette.light }}
                    />
                    {name} ({regionData[name].total})
                  </span>
                )
              })}
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="h-3 w-3 rounded border border-slate-300 dark:border-slate-600"
                  style={{ background: isDark ? '#475569' : '#e2e8f0' }}
                />
                No programs
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tier legend (list bars) */}
      {profileActive && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
          {TIER_ORDER.map((tier) => (
            <span key={tier} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${TIER_BAR_COLORS[tier]}`} />
              {tier}
            </span>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {view === 'state'
          ? sortedStates.map(([code, data]) => (
              <CountBar
                key={code}
                label={code}
                sublabel={STATE_NAMES[code]}
                count={data.total}
                maxCount={maxState}
                tiers={profileActive ? data.tiers : null}
                shortlist={data.shortlist}
                onClick={() => onSelectState(code)}
              />
            ))
          : sortedRegions.map(([name, data]) => (
              <CountBar
                key={name}
                label={name}
                count={data.total}
                maxCount={maxRegion}
                tiers={profileActive ? data.tiers : null}
                shortlist={data.shortlist}
                onClick={() => onSelectRegion(name)}
              />
            ))}
      </div>
    </div>
  )
}
