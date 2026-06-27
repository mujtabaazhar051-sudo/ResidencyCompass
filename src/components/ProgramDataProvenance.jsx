import { formatVerifiedLabel, getProgramFieldHints, OFFICIAL_SOURCES } from '../utils/dataSources'

export default function ProgramDataProvenance({ program, compact = false }) {
  const fieldHints = getProgramFieldHints(program)
  const verifyLinks = OFFICIAL_SOURCES.filter((s) => s.url && s.includedInApp !== false)
  const externalOnly = OFFICIAL_SOURCES.filter((s) => s.url && s.includedInApp === false)

  return (
    <div className={compact ? 'space-y-2' : 'mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40'}>
      {!compact && (
        <>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Data provenance</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Fields below are curated references — not official NRMP/AAMC/AMA data. Residency Explorer material is not
            stored in this app. Confirm facts on official sources before applying.
          </p>
        </>
      )}

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <dt className="font-medium text-slate-500 dark:text-slate-400">List entry verified</dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {formatVerifiedLabel(program.last_verified)}
            {program.source ? ` · Curator note: ${program.source}` : ''}
          </dd>
        </div>
        {fieldHints.map((row) => (
          <div key={row.label} className="border-t border-slate-200 pt-2 dark:border-slate-700">
            <dt className="font-medium text-slate-700 dark:text-slate-300">{row.label}</dt>
            <dd className="mt-0.5 text-slate-600 dark:text-slate-400">
              Source: {row.sources} · Verify: {row.verify}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {verifyLinks.map((src) => (
          <a
            key={src.id}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
          >
            Verify on {src.name} ↗
          </a>
        ))}
      </div>

      {externalOnly.map((src) => (
        <div key={src.id} className="mt-3 rounded-lg border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-800 dark:bg-violet-950/30">
          <p className="text-xs font-semibold text-violet-900 dark:text-violet-200">{src.fullName}</p>
          <p className="mt-1 text-xs leading-relaxed text-violet-800 dark:text-violet-300/90">{src.usage}</p>
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            {src.linkLabel || `Open ${src.name}`} ↗
          </a>
        </div>
      ))}
    </div>
  )
}
