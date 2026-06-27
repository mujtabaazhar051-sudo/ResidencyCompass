import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthModal from './components/AuthModal.jsx'

function RootInner() {
  const { isAuthenticated, loading, signOut } = useAuth()
  const [authModal, setAuthModal] = useState(null)
  const [inApp, setInApp] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const showApp = inApp || isAuthenticated
  const isDemo = demoMode && !isAuthenticated

  function enterApp() {
    setAuthModal(null)
    setDemoMode(false)
    setInApp(true)
  }

  function enterDemo() {
    setAuthModal(null)
    setDemoMode(true)
    setInApp(true)
  }

  async function leaveApp() {
    if (isDemo) {
      setDemoMode(false)
      setInApp(false)
      return
    }
    await signOut()
    setDemoMode(false)
    setInApp(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!showApp) {
    return (
      <>
        <LandingPage
          onSignIn={() => setAuthModal('signin')}
          onSignUp={() => setAuthModal('signup')}
          onTryDemo={enterDemo}
        />
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={enterApp}
            onSwitchMode={setAuthModal}
          />
        )}
      </>
    )
  }

  return (
    <>
      <App
        demoMode={isDemo}
        onLeaveApp={leaveApp}
        onCreateAccount={() => setAuthModal('signup')}
      />
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={enterApp}
          onSwitchMode={setAuthModal}
        />
      )}
    </>
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <RootInner />
    </AuthProvider>
  )
}
