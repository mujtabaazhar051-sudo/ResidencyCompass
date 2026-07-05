import { useEffect, useState } from 'react'
import DataDisclaimer from '../components/DataDisclaimer'
import FounderNote from '../components/FounderNote'
import { DISCLAIMER_SHORT, PRIVACY_LOCAL } from '../utils/dataSources'

const FEATURES = [
  {
    title: 'Personalized tiers',
    desc: 'Every program scored into TARGET, LIKELY, REACH, or LONG SHOT based on your Step 2, visa, YOG, and more.',
    icon: '🎯',
  },
  {
    title: 'IMG-specific signals',
    desc: 'Weights tuned for Pakistani applicants — Dow match history, J-1/H-1B fit, ECFMG timeline, and US rotations.',
    icon: '🩺',
  },
  {
    title: 'Connections & signals',
    desc: 'Log per-program connections and track your 3 Gold + 12 Silver ERAS signals in one place.',
    icon: '🤝',
  },
  {
    title: 'Private by default',
    desc: PRIVACY_LOCAL,
    icon: '🔒',
  },
  {
    title: 'Verify on official sources',
    desc: 'Program data comes from NRMP identifiers, ResidencyMatch.net crowdsourced reports, and community submissions — not from FREIDA or AAMC Residency Explorer.',
    icon: '✓',
  },
]

const STEPS = [
  { n: '1', title: 'Set your profile', desc: 'Step 2, visa type, ECFMG status, med school, rotations, and research.' },
  { n: '2', title: 'Review your tier list', desc: 'Filter by state, region, or tier. Shortlist programs you are seriously considering.' },
  { n: '3', title: 'Track the season', desc: 'Mark application status, log interviews, and compare programs side by side.' },
]

export default function LandingPage({ onSignIn, onSignUp, onTryDemo }) {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('imresidency_dark') === '1' } catch { return false }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { localStorage.setItem('imresidency_dark', darkMode ? '1' : '0') } catch {}
  }, [darkMode])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="ResidencyCompass" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
            <span className="text-lg font-bold">ResidencyCompass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              onClick={onTryDemo}
              className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Try demo
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onSignUp}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <FounderNote />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/60 via-transparent to-emerald-100/40 dark:from-blue-950/40 dark:to-emerald-950/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              Built for Pakistani IMGs
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Rank IM residency programs with confidence
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              ResidencyCompass scores and tiers Internal Medicine programs based on your Step 2, visa need,
              connections, rotations, and research, so you build a balanced list instead of applying blind.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSignUp}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                Get started free
              </button>
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={onTryDemo}
                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Try demo
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Free · No credit card · Demo mode does not save your list
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Everything you need for list-building</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
            One tool for scoring, filtering, shortlisting, and tracking your IM match season.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {step.n}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-br from-blue-600 to-blue-700 py-16 dark:border-slate-800 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to build your program list?</h2>
          <p className="mx-auto mt-2 max-w-lg text-blue-100">
            Sign in to save your list, or try the demo with no account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onSignUp}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={onTryDemo}
              className="rounded-xl border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              Try demo
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <DataDisclaimer variant="box" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <p className="mx-auto max-w-3xl px-4 text-center text-xs text-slate-500 dark:text-slate-400 md:px-6">
          {DISCLAIMER_SHORT}
        </p>
      </footer>
    </div>
  )
}
