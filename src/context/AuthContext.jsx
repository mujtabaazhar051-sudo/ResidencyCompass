import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseEnvDebug, isSupabaseConfigured, supabase, supabaseConfigError } from '../lib/supabase.js'

const LOCAL_SESSION_KEY = 'imresidency_session'

const AuthContext = createContext(null)

function readLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocalSession(session) {
  try {
    if (session) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(LOCAL_SESSION_KEY)
  } catch {}
}

function profileFromUser(user) {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  return {
    id: user.id,
    email: user.email ?? '',
    name: meta.full_name || meta.name || user.email?.split('@')[0] || 'User',
  }
}

function profileFromLocal(local) {
  if (!local?.email) return null
  return {
    id: local.id ?? 'local',
    email: local.email,
    name: local.name || local.email.split('@')[0],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(profileFromLocal(readLocalSession()))
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return
        setUser(profileFromUser(data.session?.user ?? null))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Supabase getSession failed:', err)
        if (!mounted) return
        setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(profileFromUser(session?.user ?? null))
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signUp({ email, password, name }) {
    if (!isSupabaseConfigured) {
      const session = { email, name, signedInAt: new Date().toISOString() }
      writeLocalSession(session)
      setUser(profileFromLocal(session))
      return { needsEmailConfirmation: false }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error

    if (data.session) {
      setUser(profileFromUser(data.user))
    }

    return { needsEmailConfirmation: !data.session }
  }

  async function signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      const local = readLocalSession()
      const session = {
        email,
        name: local?.email === email ? local.name : email.split('@')[0],
        signedInAt: new Date().toISOString(),
      }
      writeLocalSession(session)
      setUser(profileFromLocal(session))
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(profileFromUser(data.user))
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      writeLocalSession(null)
    }
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      configError: supabaseConfigError,
      envDebug: import.meta.env.DEV ? getSupabaseEnvDebug() : null,
      isAuthenticated: Boolean(user?.email),
      signUp,
      signIn,
      signOut,
      userId: user?.id ?? null,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
