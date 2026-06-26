export function isValidStep2(val) {
  const s = String(val ?? '').trim()
  if (s.length < 3) return false
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n >= 200 && n <= 300
}

export const PROFILE_COLLAPSE_KEY = 'imresidency_profile_collapsed'
export const FILTERS_COLLAPSE_KEY = 'imresidency_filters_collapsed'
export const PANELS_AUTO_COLLAPSED_KEY = 'imresidency_panels_auto_collapsed'
export const AUTO_RANKED_KEY = 'imresidency_auto_ranked'
