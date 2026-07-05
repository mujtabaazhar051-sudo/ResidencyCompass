/** Founder message — hero column on landing page. */
export default function FounderNote() {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        From the builder
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 md:text-xl">
        Why I built this
      </h2>
      <div className="mt-3 max-w-[500px] space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
      </div>
    </aside>
  )
}
