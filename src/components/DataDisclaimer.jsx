import { DISCLAIMER_FOOTER, DISCLAIMER_SHORT } from '../utils/dataSources'

export default function DataDisclaimer({ variant = 'footer', className = '' }) {
  if (variant === 'banner') {
    return (
      <div
        className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200 ${className}`}
        role="note"
      >
        <p className="font-semibold">Verify before you apply</p>
        <p className="mt-1 leading-relaxed text-amber-800 dark:text-amber-300/90">{DISCLAIMER_SHORT}</p>
      </div>
    )
  }

  if (variant === 'box') {
    return (
      <div
        className={`rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm dark:border-amber-800 dark:bg-amber-900/20 ${className}`}
        role="note"
      >
        <h4 className="mb-1.5 font-semibold text-amber-900 dark:text-amber-300">Disclaimer</h4>
        <p className="leading-relaxed text-amber-800 dark:text-amber-400">{DISCLAIMER_FOOTER}</p>
      </div>
    )
  }

  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}>
      {DISCLAIMER_FOOTER}
    </p>
  )
}
