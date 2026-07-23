import { useState } from 'react'

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to ResidencyCompass',
    desc: 'A free tool that helps Pakistani IMGs explore U.S. Internal Medicine programs more clearly. Share your background once, and see how programs may align with your preferences and training goals.',
    bullets: [
      'Curated IM programs with context on visas, geography, and pathways',
      'A structured fit model — not a Match predictor',
      'Your list, signals, and notes stay private in your browser',
    ],
    tip: 'This quick tour takes about 2 minutes. You will land on the Profile tab when you are done.',
  },
  {
    icon: '👤',
    title: 'Step 1 — Complete your profile',
    desc: 'Start on the Profile tab. At minimum enter your Step 2 CK score — that unlocks program exploration. Add the rest for a clearer picture of fit.',
    bullets: [
      'Step 2 CK (required) and optional Step 3',
      'Visa type (J-1, H-1B, none) and ECFMG status',
      'Medical school, year of graduation, ERAS region preferences (up to 3), US clinical rotations',
      'Research level (publications, presentations, none)',
    ],
    tip: 'After entering Step 2, program fit updates in the background. Click Update tier list whenever you change profile fields.',
  },
  {
    icon: '🏆',
    title: 'Understanding fit tiers',
    desc: 'Each program gets a fit score and one of four tiers based on how your background and preferences may relate to that program.',
    bullets: [
      'TARGET — stronger alignment worth a closer look',
      'LIKELY — reasonable mutual fit to explore further',
      'REACH — possible, but more competitive relative to your profile',
      'LONG SHOT — weaker alignment; decide thoughtfully',
    ],
    tip: 'Open How Scoring Works to see the model. Tiers are a guide for exploration — always verify on program websites.',
  },
  {
    icon: '📋',
    title: 'Browse and filter programs',
    desc: 'The Programs tab is your main workspace. Search by name, filter by state, tier, or application status, and expand any card for full details.',
    bullets: [
      'Compare up to 3 programs side-by-side',
      'Star programs to build a shortlist',
      'Export My List or Shortlist as CSV anytime',
      'By State tab shows a map of program counts',
    ],
    tip: 'Start with TARGET + LIKELY, then explore REACH programs where you have a genuine connection or geographic preference.',
  },
  {
    icon: '🤝',
    title: 'Log connections on each card',
    desc: 'Meaningful relationships matter for fit. For every program, set Weak, Moderate, or Strong based on your real contact there.',
    bullets: [
      'Strong — direct mentor, PD, or faculty you worked with',
      'Moderate — met them, exchanged emails, or rotated nearby',
      'Weak — peripheral contact or second-degree introduction',
      'Add contact names in the card notes (private to you)',
    ],
    tip: 'Be honest about connection strength — it helps you gauge fit, not inflate a score.',
  },
  {
    icon: '⭐',
    title: 'Track Gold & Silver signals',
    desc: 'ERAS lets you send 3 Gold and 12 Silver signals. Assign them on program cards where your interest and fit feel sincere.',
    bullets: [
      'Gold — highest priority; programs you would be glad to train at',
      'Silver — strong secondary interest across realistic options',
      'The header tracks your remaining signal budget (3 Gold / 12 Silver)',
      'Signals communicate genuine interest — use them thoughtfully',
    ],
    tip: 'Signal where profile, geography, connection, and interest align — not prestige alone.',
  },
  {
    icon: '📬',
    title: 'Track applications & interviews',
    desc: 'Use the Status dropdown on each program card to track your season. When you mark II Received, the program moves to the Interviews tab.',
    bullets: [
      'Statuses: Applied → II Received → Declined / Waitlisted / Matched',
      'Interviews tab — invite date, interview date, format, notes',
      'Interview count badge in the tab bar',
    ],
    tip: 'Keeping status updated helps you see how exploration translates into conversations with programs.',
  },
  {
    icon: '🌍',
    title: 'Community data & your account',
    desc: 'Optional de-identified interview reports help peers learn from one another. Sign in to save your list and contribute.',
    bullets: [
      'Interview Report — share whether you got an II (email hidden publicly)',
      'Browse Reports — see what others submitted this cycle',
      'Join the Team — volunteer to help curate data or improve the app',
      'Signed-in users get cloud backup of profile, signals, and notes',
    ],
    tip: 'You can replay this tour anytime from the ? button in the header.',
  },
]

export default function OnboardingTour({ onDone, isAuthenticated = false }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6">
      <div className="relative flex max-h-[min(90vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">

        <div className="h-1 shrink-0 bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? 'w-6 bg-blue-500'
                      : i < step
                      ? 'w-3 bg-blue-300 dark:bg-blue-600'
                      : 'w-3 bg-slate-200 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onDone}
              className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              Skip tour
            </button>
          </div>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-900/30">
            {current.icon}
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {current.title}
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            {current.desc}
          </p>

          {current.bullets?.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {current.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-blue-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            💡 {current.tip}
          </div>

          {isLast && isAuthenticated && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Your account is connected — profile and list changes will sync when you are signed in.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4 sm:px-8 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
          >
            {isLast ? 'Start my profile →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
