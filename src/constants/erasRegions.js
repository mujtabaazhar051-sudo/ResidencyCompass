/** ERAS geographic divisions — same census regions used on program cards. */

export const MAX_ERAS_REGIONS = 3

export const ERAS_REGIONS = [
  { value: 'New England', short: 'New England' },
  { value: 'Middle Atlantic', short: 'Mid Atlantic' },
  { value: 'East North Central', short: 'East N Central' },
  { value: 'West North Central', short: 'West N Central' },
  { value: 'South Atlantic', short: 'South Atlantic' },
  { value: 'East South Central', short: 'East S Central' },
  { value: 'West South Central', short: 'West S Central' },
  { value: 'Mountain', short: 'Mountain' },
  { value: 'Pacific', short: 'Pacific' },
]

export const ERAS_REGION_VALUES = ERAS_REGIONS.map((r) => r.value)

export function formatErasRegions(regions) {
  const list = normalizeErasRegions(regions)
  if (!list.length) return ''
  return list.join(', ')
}

export function normalizeErasRegions(regions) {
  if (!regions) return []
  if (Array.isArray(regions)) {
    return regions.filter((r) => ERAS_REGION_VALUES.includes(r))
  }
  if (typeof regions === 'string') {
    try {
      const parsed = JSON.parse(regions)
      if (Array.isArray(parsed)) return normalizeErasRegions(parsed)
    } catch {
      return regions.split(',').map((s) => s.trim()).filter((r) => ERAS_REGION_VALUES.includes(r))
    }
  }
  return []
}
