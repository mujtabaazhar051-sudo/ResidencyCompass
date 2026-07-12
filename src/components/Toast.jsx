import { useEffect } from 'react'

const VARIANTS = {
  info:    'border-slate-200 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  error:   'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-100',
}

export default function Toast({ message, variant = 'info', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  return (
    <div
      role="status"
      className={`no-print safe-bottom fixed bottom-20 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-start gap-3 rounded-xl border px-4 py-3 shadow-lg sm:bottom-6 sm:max-w-md ${VARIANTS[variant] ?? VARIANTS.info}`}
    >
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-sm opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
