import { isSupabaseConfigured, supabase } from './supabase'

const STORAGE_PREFIX = 'imresidency_v1'

export function localStorageKey(userId) {
  if (!userId || userId === 'local') return STORAGE_PREFIX
  return `${STORAGE_PREFIX}_${userId}`
}

export function packAppState(state) {
  return {
    profile: state.profile,
    signals: state.signals,
    connections: state.connections,
    notes: state.notes,
    statuses: state.statuses,
    ivDates: state.ivDates,
    shortlist: state.shortlist,
  }
}

export function hasAppStateData(state) {
  if (!state || typeof state !== 'object') return false
  return Boolean(
    state.profile?.step2 ||
      Object.keys(state.signals ?? {}).length > 0 ||
      Object.keys(state.connections ?? {}).length > 0 ||
      Object.keys(state.notes ?? {}).length > 0 ||
      Object.keys(state.statuses ?? {}).length > 0 ||
      Object.keys(state.ivDates ?? {}).length > 0 ||
      Object.keys(state.shortlist ?? {}).length > 0,
  )
}

/** Prefer existing map values; fill missing keys from the other map. */
export function mergeMapField(primary = {}, secondary = {}) {
  const out = { ...(primary && typeof primary === 'object' ? primary : {}) }
  for (const [key, value] of Object.entries(secondary && typeof secondary === 'object' ? secondary : {})) {
    if (value == null || value === '') continue
    if (out[key] == null || out[key] === '') out[key] = value
  }
  return out
}

/**
 * Merge local + remote app state without letting an older/partial cloud
 * snapshot wipe shortlist, signals, notes, etc.
 * Earlier arguments win on conflicts; later ones only fill gaps.
 */
export function mergeAppStates(...states) {
  const present = states.filter((s) => s && typeof s === 'object')
  if (!present.length) return null

  const withStep2 = [...present].reverse().find((s) => s.profile?.step2)
  const mergedProfile = present.reduce(
    (acc, s) => ({ ...acc, ...(s.profile && typeof s.profile === 'object' ? s.profile : {}) }),
    {},
  )
  if (withStep2?.profile?.step2) mergedProfile.step2 = withStep2.profile.step2

  return {
    profile: mergedProfile,
    signals: present.reduce((acc, s) => mergeMapField(acc, s.signals), {}),
    connections: present.reduce((acc, s) => mergeMapField(acc, s.connections), {}),
    notes: present.reduce((acc, s) => mergeMapField(acc, s.notes), {}),
    statuses: present.reduce((acc, s) => mergeMapField(acc, s.statuses), {}),
    ivDates: present.reduce((acc, s) => mergeMapField(acc, s.ivDates), {}),
    shortlist: present.reduce((acc, s) => mergeMapField(acc, s.shortlist), {}),
  }
}

export function loadLocalState(userId) {
  try {
    const key = localStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)

    // One-time migration from pre-auth browser storage
    if (userId && userId !== 'local') {
      const legacy = localStorage.getItem(STORAGE_PREFIX)
      if (legacy) return JSON.parse(legacy)
    }
    return null
  } catch {
    return null
  }
}

export function saveLocalState(userId, state) {
  try {
    localStorage.setItem(localStorageKey(userId), JSON.stringify(state))
  } catch {}
}

export async function fetchRemoteUserState(userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'local') {
    return null
  }

  const { data, error } = await supabase
    .from('user_app_state')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveRemoteUserState(userId, state) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'local') {
    return
  }

  const { error } = await supabase.from('user_app_state').upsert(
    {
      user_id: userId,
      state: packAppState(state),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) throw error
}
