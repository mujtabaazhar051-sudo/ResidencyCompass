const SHORT_REASONS = {
  connection: ({ score }) => {
    if (score >= 20) return 'Strong connection'
    if (score >= 10) return 'Moderate connection'
    if (score > 0) return 'Connection boost'
    return null
  },
  dowPak: ({ score }) => {
    if (score > 0) return 'Dow/Pak match history'
    if (score < 0) return 'Limited Pak pipeline'
    return null
  },
  step2: ({ score }) => {
    if (score >= 8) return 'Step 2 strong fit'
    if (score >= 4) return 'Step 2 on par'
    if (score > 0) return 'Step 2 fits profile'
    if (score < 0) return 'Step 2 below average'
    return null
  },
  step3: ({ score }) => (score > 0 ? 'Step 3 complete' : null),
  ecfmg: ({ score }) => {
    if (score > 0) return 'ECFMG certified'
    if (score < 0) return 'ECFMG not complete'
    return null
  },
  visaStatus: ({ score }) => (score > 0 ? 'No visa needed' : null),
  yogGap: ({ score }) => (score < 0 ? 'YOG gap penalty' : null),
  rotations: ({ score, note }) => {
    if (note?.includes('this program')) return 'Rotated here'
    if (score >= 4) return 'US rotation in state'
    if (score > 0) return 'US clinical experience'
    return null
  },
  erasRegion: ({ score }) => (score > 0 ? 'ERAS region match' : null),
  research: ({ score }) => (score > 0 ? 'Research profile fit' : null),
  programType: ({ score }) => {
    if (score > 0) return 'Community program fit'
    if (score < 0) return 'Academic program'
    return null
  },
  signal: ({ score }) => (score > 5 ? 'Signal boost' : null),
  penalty: ({ score }) => (score < 0 ? 'Program caution flags' : null),
}

export function buildWhyThisTier(breakdown) {
  if (!breakdown) return null

  const ranked = Object.entries(breakdown)
    .map(([key, val]) => ({
      key,
      score: val.score ?? 0,
      phrase: SHORT_REASONS[key]?.(val),
    }))
    .filter((item) => item.phrase)

  if (ranked.length === 0) return null

  ranked.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))

  const positives = ranked.filter((item) => item.score > 0).slice(0, 3)
  const negatives = ranked.filter((item) => item.score < 0).slice(0, 1)
  const combined = [...positives, ...negatives.filter((n) => !positives.includes(n))]

  return combined
    .slice(0, 3)
    .map((item) => item.phrase)
    .join(' · ')
}

export const CARD_MODE_KEY = 'imresidency_card_mode'
