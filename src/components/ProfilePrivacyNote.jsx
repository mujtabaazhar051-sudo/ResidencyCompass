/** Lightweight privacy reassurance — shown above profile inputs. */
export default function ProfilePrivacyNote() {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/40">
      <span className="mt-0.5 shrink-0 text-lg leading-none text-slate-500 dark:text-slate-400" aria-hidden="true">
        🛡️
      </span>
      <div className="min-w-0 max-w-[500px]">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Your data stays on your device.
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Everything you enter — Step scores, visa status, rotations — is calculated right in your browser. We
          don&apos;t have a server that stores your personal profile, and you don&apos;t need an account or real email
          to try it. If you choose to submit a match outcome to help other applicants, that&apos;s a separate,
          optional step, and it&apos;s anonymized before it&apos;s shared.
        </p>
      </div>
    </div>
  )
}
