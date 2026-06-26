import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

function configError() {
  if (!url || !anonKey) return null
  if (!url.includes('.supabase.co')) {
    return 'VITE_SUPABASE_URL must be your Supabase project URL (https://xxxx.supabase.co), not your Vercel or website URL.'
  }
  if (anonKey.startsWith('sb_secret_') || anonKey.includes('service_role')) {
    return 'VITE_SUPABASE_ANON_KEY must be the anon PUBLIC key (starts with eyJ…), not a secret or service_role key.'
  }
  if (!anonKey.startsWith('eyJ')) {
    return 'VITE_SUPABASE_ANON_KEY does not look like a valid anon key. Copy "anon public" from Supabase → Settings → API.'
  }
  return null
}

export const supabaseConfigError = configError()
export const isSupabaseConfigured = Boolean(url && anonKey && !supabaseConfigError)

/** Dev helper — never log full key */
export function getSupabaseEnvDebug() {
  return {
    url: url || null,
    hasKey: Boolean(anonKey),
    keyLength: anonKey.length,
    configError: supabaseConfigError,
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
