import { useMemo, useState } from 'react'
import usaMap from '@svg-maps/usa'
import { TIER_ORDER } from '../scoring/engine'

const REGION_FILLS = {
  'Middle Atlantic':     { light: '#93c5fd', dark: '#2563eb' },
  'East North Central':  { light: '#6ee7b7', dark: '#059669' },
  'South Atlantic':      { light: '#c4b5fd', dark: '#7c3aed' },
  'West South Central':  { light: '#fcd34d', dark: '#d97706' },
  'East South Central':  { light: '#fca5a5', dark: '#dc2626' },
  'New England':         { light: '#67e8f9', dark: '#0891b2' },
  'West North Central':  { light: '#bef264', dark: '#65a30d' },
  'Mountain':            { light: '#fdba74', dark: '#ea580c' },
  'Pacific':             { light: '#f9a8d4', dark: '#db2777' },
}

const TIER_FILLS = {
  TARGET:      { light: '#6ee7b7', dark: '#059669' },
  LIKELY:      { light: '#93c5fd', dark: '#2563eb' },
  REACH:       { light: '#fcd34d', dark: '#d97706' },
  'LONG SHOT': { light: '#cbd5e1', dark: '#64748b' },
}

function dominantTier(tiers) {
  if (!tiers) return null
  let best = null
  let bestN = 0
  for (const tier of TIER_ORDER) {
    const n = tiers[tier] || 0
    if (n > bestN) {
      bestN = n
      best = tier
    }
  }
  return best
}

function countFill(count, maxCount, isDark) {
  if (!count || maxCount <= 0) {
    return isDark ? '#475569' : '#e2e8f0'
  }
  const t = Math.min(1, count / maxCount)
  if (isDark) {
    return `hsl(217, ${28 + t * 52}%, ${20 + t * 30}%)`
  }
  return `hsl(214, ${38 + t * 42}%, ${90 - t * 40}%)`
}

function regionFill(region, hasData, isDark) {
  if (!region || !hasData) {
    return isDark ? '#475569' : '#e2e8f0'
  }
  const palette = REGION_FILLS[region]
  if (!palette) return isDark ? '#475569' : '#e2e8f0'
  return isDark ? palette.dark : palette.light
}

function tierFill(tier, isDark) {
  if (!tier) return isDark ? '#475569' : '#e2e8f0'
  const palette = TIER_FILLS[tier]
  return isDark ? palette.dark : palette.light
}

export { REGION_FILLS, countFill, tierFill }

export default function USStateMap({
  stateData = {},
  stateToRegion = {},
  regionData = {},
  view = 'state',
  colorMode = 'count',
  maxCount = 1,
  profileActive = false,
  selectedState = null,
  selectedRegion = null,
  isDark = false,
  onSelectState,
  onSelectRegion,
}) {
  const [hoveredCode, setHoveredCode] = useState(null)

  const hoveredInfo = useMemo(() => {
    if (!hoveredCode) return null
    const data = stateData[hoveredCode]
    const region = stateToRegion[hoveredCode]
    const loc = usaMap.locations.find((l) => l.id === hoveredCode.toLowerCase())
    return {
      code: hoveredCode,
      name: loc?.name ?? hoveredCode,
      region,
      total: data?.total ?? 0,
      shortlist: data?.shortlist ?? 0,
      tiers: data?.tiers ?? {},
    }
  }, [hoveredCode, stateData, stateToRegion])

  function fillForState(code) {
    const data = stateData[code]
    const count = data?.total ?? 0

    if (view === 'region') {
      const region = stateToRegion[code]
      const hasData = region && (regionData[region]?.total ?? 0) > 0
      return regionFill(region, hasData, isDark)
    }

    if (profileActive && colorMode === 'tier') {
      return tierFill(dominantTier(data?.tiers), isDark)
    }

    return countFill(count, maxCount, isDark)
  }

  function isSelected(code) {
    if (selectedState && selectedState === code) return true
    if (selectedRegion && stateToRegion[code] === selectedRegion) return true
    return false
  }

  function handleClick(code) {
    if (view === 'region') {
      const region = stateToRegion[code]
      if (region && regionData[region]?.total > 0) {
        onSelectRegion?.(region)
      } else if (stateData[code]?.total > 0) {
        onSelectState?.(code)
      }
      return
    }
    if (stateData[code]?.total > 0) {
      onSelectState?.(code)
    }
  }

  return (
    <div className="relative">
      <svg
        viewBox={usaMap.viewBox}
        className="h-auto w-full max-h-[420px] touch-manipulation"
        role="img"
        aria-label="Map of the United States showing program counts by state"
      >
        {usaMap.locations.map((loc) => {
          const code = loc.id.toUpperCase()
          const count = stateData[code]?.total ?? 0
          const hasPrograms = count > 0
          const hovered = hoveredCode === code
          const selected = isSelected(code)

          return (
            <path
              key={loc.id}
              d={loc.path}
              fill={fillForState(code)}
              stroke={
                selected
                  ? isDark ? '#f8fafc' : '#0f172a'
                  : hovered
                  ? isDark ? '#94a3b8' : '#64748b'
                  : isDark ? '#334155' : '#cbd5e1'
              }
              strokeWidth={selected ? 2.2 : hovered ? 1.8 : 0.75}
              className={`transition-[fill,stroke,stroke-width] duration-150 ${
                hasPrograms || (view === 'region' && stateToRegion[code] && regionData[stateToRegion[code]]?.total > 0)
                  ? 'cursor-pointer'
                  : 'cursor-default'
              }`}
              onMouseEnter={() => setHoveredCode(code)}
              onMouseLeave={() => setHoveredCode(null)}
              onFocus={() => setHoveredCode(code)}
              onBlur={() => setHoveredCode(null)}
              onClick={() => handleClick(code)}
              tabIndex={hasPrograms ? 0 : -1}
              aria-label={`${loc.name}, ${count} program${count !== 1 ? 's' : ''}`}
            />
          )
        })}
      </svg>

      {hoveredInfo && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/95"
          role="tooltip"
        >
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {hoveredInfo.name}
            <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">{hoveredInfo.code}</span>
          </p>
          {hoveredInfo.region && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{hoveredInfo.region}</p>
          )}
          <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
            {hoveredInfo.total} program{hoveredInfo.total !== 1 ? 's' : ''}
            {hoveredInfo.shortlist > 0 && (
              <span className="ml-2 text-rose-600 dark:text-rose-400">⭐ {hoveredInfo.shortlist} shortlisted</span>
            )}
          </p>
          {profileActive && hoveredInfo.total > 0 && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {TIER_ORDER.map((tier) => {
                const n = hoveredInfo.tiers[tier] || 0
                if (!n) return null
                return `${tier}: ${n}`
              }).filter(Boolean).join(' · ')}
            </p>
          )}
          {hoveredInfo.total > 0 && (
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">Click to filter programs</p>
          )}
        </div>
      )}
    </div>
  )
}
