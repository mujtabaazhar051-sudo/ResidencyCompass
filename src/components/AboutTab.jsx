import { useState } from 'react'
import DataDisclaimer from './DataDisclaimer'
import FounderNoteModal, { FounderNoteButton } from './FounderNote'
import { PROJECT_EMAIL } from '../constants/contact'
import TeamGrid from './TeamGrid'
import {
  OFFICIAL_SOURCES,
  PROGRAM_FIELD_SOURCES,
  PRIVACY_ACCOUNT,
  PRIVACY_LOCAL,
} from '../utils/dataSources'

export default function AboutTab() {
  const [showFounderNote, setShowFounderNote] = useState(false)

  return (
    <div className="space-y-6">

      <FounderNoteModal open={showFounderNote} onClose={() => setShowFounderNote(false)} />

      {/* Hero */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50 px-6 py-8 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <img src="/favicon.svg" alt="ResidencyCompass logo" className="h-16 w-16 rounded-2xl object-contain shadow-md" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ResidencyCompass</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                A free tool that helps Pakistani IMGs explore U.S. Internal Medicine programs more clearly — with an eye toward mutual fit.
              </p>
            </div>
          </div>
          <FounderNoteButton onClick={() => setShowFounderNote(true)} compact expanded={showFounderNote} />
        </div>
      </div>

      <DataDisclaimer variant="banner" />

      {/* Team */}
      <Card title="The team">
        <TeamGrid
          intro={
            <p className="mb-5 leading-relaxed text-slate-600 dark:text-slate-400">
              Built by Pakistani IMGs — for clearer exploration of U.S. IM programs, and better mutual fit.
              Want to help? Visit <strong>Community Data → Join the Team</strong> or email{' '}
              <a href={`mailto:${PROJECT_EMAIL}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {PROJECT_EMAIL}
              </a>
              .
            </p>
          }
        />
      </Card>

      {/* What it is */}
      <Card title="What is ResidencyCompass?">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          ResidencyCompass is a free, browser-based tool that helps Pakistani International Medical Graduate (IMG) applicants
          explore U.S. Internal Medicine programs more clearly. You share your background — Step 2 CK, visa need,
          ECFMG status, year of graduation, geographic preferences, US clinical experience, research, and meaningful
          connections — and the tool organizes programs using a structured view of how those factors may relate to
          each program’s setting and pathways.
        </p>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          Programs are grouped into four fit tiers: <strong className="text-emerald-700 dark:text-emerald-400">TARGET</strong>,{' '}
          <strong className="text-blue-700 dark:text-blue-400">LIKELY</strong>,{' '}
          <strong className="text-amber-700 dark:text-amber-400">REACH</strong>, and{' '}
          <strong className="text-slate-600 dark:text-slate-400">LONG SHOT</strong> — so you can reflect on where
          applicant and program interests may align, rather than navigating opaque lists alone.
        </p>
      </Card>

      {/* Why it was built */}
      <Card title="Why was this built?">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Choosing where to apply is hard for every IMG — and Pakistani graduates often weigh extra dimensions:
          visa sponsorship, ECFMG timelines, US clinical experience, and whether a program has a history of training
          graduates from similar backgrounds. Information is scattered, and it is easy to lose sight of mutual fit.
        </p>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          ResidencyCompass brings curated program context and your own preferences into one structured place —
          including Pakistani graduate pathways, geography, and community-shared interview
          reports — so applicants can explore thoughtfully, and programs are more likely to see candidates who
          genuinely align with their setting.
        </p>
      </Card>

      {/* How to use it */}
      <Card title="How to get the most out of it">
        <ol className="space-y-3 text-slate-600 dark:text-slate-400">
          {[
            { n: '1', title: 'Complete your profile thoughtfully', desc: 'Accurate Step 2, YOG, visa status, ECFMG status, and ERAS region preferences (up to 3) make fit estimates more meaningful.' },
            { n: '2', title: 'Note real connections', desc: 'Open each program card and log connection strength where you have a genuine relationship — honesty helps you and the programs you engage.' },
            { n: '3', title: 'Use signals intentionally', desc: 'Gold and Silver signals express sincere interest. Assign them where fit and interest align.' },
            { n: '4', title: 'Read How Scoring Works', desc: 'Understanding the model helps you interpret tiers as a guide for exploration, not a prediction.' },
            { n: '5', title: 'Cross-check with official sources', desc: 'Always verify program data (positions, visa types, PD details) on each program website before applying.' },
          ].map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {step.n}
              </span>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{step.title}</span>
                <span className="text-slate-500 dark:text-slate-400"> — {step.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Official sources */}
      <Card title="Official sources to verify against">
        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          ResidencyCompass <strong>references</strong> these sources for context. We are{' '}
          <strong>not affiliated with, endorsed by, or authorized to redistribute</strong> their data. Use the links below
          to confirm every fact before you apply.
        </p>
        <ul className="space-y-4">
          {OFFICIAL_SOURCES.map((src) => (
            <li key={src.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {src.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{src.fullName}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open ↗
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{src.usage}</p>
              {src.restrictions?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-500 dark:text-slate-400">
                  {src.restrictions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* Field-level provenance */}
      <Card title="How program fields are sourced">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Each program card shows a <strong>Data provenance</strong> section with the last curator check date and where
          individual fields typically come from. Expand any card to see it.
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Field group</th>
                <th className="px-3 py-2 font-semibold">Typical source</th>
                <th className="px-3 py-2 font-semibold">Important</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {PROGRAM_FIELD_SOURCES.map((row) => (
                <tr key={row.fields}>
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{row.fields}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.sources.join(', ')}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Contact & contribute */}
      <Card title="Contact & contribute">
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
          ResidencyCompass is built by Pakistani IMGs, for Pakistani IMGs — to support clearer exploration and better
          mutual fit. Want to help curate program data, improve the app, or share de-identified interview learning?
          Visit the <strong>Community Data → Join the Team</strong> tab or email{' '}
          <a href={`mailto:${PROJECT_EMAIL}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            {PROJECT_EMAIL}
          </a>
          .
        </p>
      </Card>

      {/* Privacy */}
      <Card title="Privacy">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {PRIVACY_LOCAL}{' '}
          {PRIVACY_ACCOUNT}{' '}
          Clearing browser data or switching devices starts fresh for your list — export via <strong>⭐ My List</strong> if you want a backup.
        </p>
      </Card>

      <DataDisclaimer variant="box" />

    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 border-b border-slate-100 pb-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
        {title}
      </h3>
      {children}
    </div>
  )
}
