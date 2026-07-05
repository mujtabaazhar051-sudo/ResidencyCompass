import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const FOUNDER_NOTE_BODY = (
  <>
    <p>
      I&apos;m Mujtaba, a Dow grad going through the IM Match myself. I&apos;ve tracked 100+ programs across
      spreadsheets that never matched each other, plus scattered WhatsApp advice about visa sponsorship and which
      programs actually take Pakistani grads. It cost more time than it should have, and it led to worse decisions
      than it needed to.
    </p>
    <p>
      ResidencyCompass is what I wish I&apos;d had — a place that scores programs against your own profile and tells
      you honestly where you stand, instead of applying blind to a hundred places. It&apos;s free, it&apos;s not
      affiliated with NRMP/AAMC/AMA, and it&apos;s still growing. If you&apos;re going through this too, I built it
      for you as much as for myself.
    </p>
  </>
)

export function FounderNoteButton({ onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        compact
          ? 'rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
          : 'rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
      }
    >
      Founder&apos;s note
    </button>
  )
}

export default function FounderNoteModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 md:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="founder-note-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          From the builder
        </p>
        <h2 id="founder-note-title" className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          Why I built this
        </h2>
        <div className="mt-4 max-w-[500px] space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
          {FOUNDER_NOTE_BODY}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
