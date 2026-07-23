import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PRIVACY_SHORT } from '../utils/dataSources'

export default function AuthModal({ mode = 'signin', onClose, onSuccess, onSwitchMode }) {
  const { signIn, signUp, isConfigured, configError, envDebug } = useAuth()
  const isSignUp = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (isSignUp && !name.trim()) {
      setError('Enter your name.')
      return
    }

    setBusy(true)
    try {
      if (isSignUp) {
        const { needsEmailConfirmation } = await signUp({
          email: trimmedEmail,
          password,
          name: name.trim(),
        })
        if (needsEmailConfirmation) {
          setInfo('Check your email to confirm your account, then sign in.')
          return
        }
      } else {
        await signIn({ email: trimmedEmail, password })
      }
      onSuccess?.()
    } catch (err) {
      const msg = err?.message ?? ''
      if (msg.includes('JSON') || msg.includes('fetch')) {
        setError(
          import.meta.env.DEV
            ? 'Could not reach Supabase. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart npm run dev.'
            : 'Sign-in is temporarily unavailable. Please try again later.',
        )
      } else {
        setError(msg || 'Sign in failed. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6 flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl object-contain" />
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isSignUp ? 'Start exploring program fit in minutes.' : 'Sign in to continue to your list.'}
            </p>
          </div>
        </div>

        {import.meta.env.DEV && envDebug && (
          <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
            Dev: URL={envDebug.url ?? 'missing'} · key={envDebug.hasKey ? `${envDebug.keyLength} chars` : 'missing'}
            {envDebug.configError ? ` · ${envDebug.configError}` : ''}
          </p>
        )}

        {!isConfigured && (
          import.meta.env.DEV ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {configError ?? (
                <>Supabase is not configured. Add <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">VITE_SUPABASE_URL</code> and <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">VITE_SUPABASE_ANON_KEY</code> to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">.env</code>, then restart dev. See docs/DEPLOY.md.</>
              )}
            </p>
          ) : (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Sign-in is temporarily unavailable. Please try again later.
            </p>
          )
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || (!isConfigured && import.meta.env.PROD)}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => onSwitchMode?.(isSignUp ? 'signin' : 'signup')}
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          {PRIVACY_SHORT}
        </p>
      </div>
    </div>
  )
}
