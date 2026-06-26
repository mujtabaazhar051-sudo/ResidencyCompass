/**
 * Check Supabase env without printing secrets.
 * Run: node scripts/checkSupabaseEnv.mjs
 */
import { loadEnv } from 'vite'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = loadEnv('development', root, 'VITE_')

const url = (env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const key = (env.VITE_SUPABASE_ANON_KEY ?? '').trim()

console.log('--- Supabase env check ---')
console.log('URL:', url || '(missing)')
console.log('Anon key present:', Boolean(key))
console.log('Anon key length:', key.length)
console.log('URL looks like Supabase:', url.includes('.supabase.co'))
console.log('Key looks like anon JWT:', key.startsWith('eyJ'))

if (!url || !key) {
  console.log('\nFix: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or .env.local')
  process.exit(1)
}

try {
  const res = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: key },
  })
  const text = await res.text()
  console.log('\nHealth check HTTP status:', res.status)
  console.log('Health response:', text || '(empty body — project may be paused or URL wrong)')
  if (!text) {
    console.log('\nEmpty response often means: wrong URL, paused Supabase project, or network block.')
    process.exit(1)
  }
} catch (err) {
  console.error('\nNetwork error reaching Supabase:', err.message)
  process.exit(1)
}

console.log('\nEnv looks OK. If login still fails on Vercel, update env vars THERE and redeploy.')
