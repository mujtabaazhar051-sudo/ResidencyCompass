import { useState } from 'react'

const STEPS = [
  {
    icon: '👤',
    title: 'Start with your profile',
    desc: 'On the Profile tab, enter your Step 2 score, visa type, ECFMG status, med school, and year of graduation. Every program score is calculated from this — the more complete it is, the more accurate your rankings.',
    tip: 'Tip: Profile lives on its own tab — set it once, then spend most of your time on Programs.',
  },
  {
    icon: '🏆',
    title: 'Programs rank into four tiers',
    desc: 'The scoring engine assigns each program to TARGET, LIKELY, REACH, or LONG SHOT based on your profile match. Click Update tier list any time you change something.',
    tip: 'Scores consider Step 2 vs. program median, visa compatibility, Dow/Pak match history, and more.',
  },
  {
    icon: '🤝',
    title: 'Log connections per program',
    desc: 'Open any program card and tap Weak / Moderate / Strong to log your contact there. A strong connection can push a program from REACH to TARGET.',
    tip: 'You can also note the contact names inside the card — they\'re saved privately in your browser.',
  },
  {
    icon: '⭐',
    title: 'Signal your top programs',
    desc: 'ERAS lets you send 3 Gold signals and 12 Silver signals. Use them on programs where you\'d genuinely be happy to match — they boost your score there.',
    tip: 'Gold and Silver caps are tracked in the header so you always know your remaining budget.',
  },
  {
    icon: '📬',
    title: 'Track applications & interviews',
    desc: 'Use the Status dropdown on each card (Applied → II Received → etc.). Programs you mark as II Received automatically appear in the Interviews tab where you can track dates and notes.',
    tip: 'Your list, signals, and notes stay in this browser. Sign-in is only for account access and optional community submissions.',
  },
]

export default function OnboardingTour({ onDone }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="px-8 py-7">
          {/* Dot indicators + skip */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-1.5">
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

          {/* Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-900/30">
            {current.icon}
          </div>

          {/* Content */}
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {current.title}
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            {current.desc}
          </p>

          {/* Tip */}
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            💡 {current.tip}
          </div>

          {/* Step counter */}
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4 dark:border-slate-700">
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
            {isLast ? "Let's go →" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
