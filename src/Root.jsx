import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthModal from './components/AuthModal.jsx'

function RootInner() {
  const { isAuthenticated, loading, signOut } = useAuth()
  const [authModal, setAuthModal] = useState(null)
  const [inApp, setInApp] = useState(false)

  const showApp = inApp || isAuthenticated

  function enterApp() {
    setAuthModal(null)
    setInApp(true)
  }

  async function leaveApp() {
    await signOut()
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

  return <App onLeaveApp={leaveApp} />
}

export default function Root() {
  return (
    <AuthProvider>
      <RootInner />
    </AuthProvider>
  )
}
