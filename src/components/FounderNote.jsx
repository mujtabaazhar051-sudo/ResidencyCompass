/** Founder message — landing page, near hero. */
export default function FounderNote() {
  return (
    <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="max-w-[500px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            From the builder
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
            Why I built this
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
            <p>
              I&apos;m Mujtaba, a Dow grad going through the IM Match myself. I&apos;ve tracked 100+ programs across
              spreadsheets that never matched each other, plus scattered WhatsApp advice about visa sponsorship and which
              programs actually take Pakistani grads. It cost more time than it should have, and it led to worse
              decisions than it needed to.
            </p>
            <p>
              ResidencyCompass is what I wish I&apos;d had — a place that scores programs against your own profile and
              tells you honestly where you stand, instead of applying blind to a hundred places. It&apos;s free,
              it&apos;s not affiliated with NRMP/AAMC/AMA, and it&apos;s still growing. If you&apos;re going through
              this too, I built it for you as much as for myself.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
