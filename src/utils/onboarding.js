/** Per-user onboarding completion flag in localStorage. */
export function onboardingStorageKey(userId, demoMode) {
  if (demoMode) return 'imresidency_onboarded_demo'
  if (userId && userId !== 'local') return `imresidency_onboarded_${userId}`
  return 'imresidency_onboarded'
}

export function hasCompletedOnboarding(userId, demoMode) {
  try {
    if (localStorage.getItem(onboardingStorageKey(userId, demoMode)) === '1') return true
    // Legacy flag from builds before per-user onboarding keys
    if (localStorage.getItem('imresidency_onboarded') === '1') return true
    return false
  } catch {
    return false
  }
}

export function markOnboardingComplete(userId, demoMode) {
  try {
    localStorage.setItem(onboardingStorageKey(userId, demoMode), '1')
  } catch {}
}
