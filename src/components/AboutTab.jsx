import { useState } from 'react'
import DataDisclaimer from './DataDisclaimer'
import FounderNoteModal, { FounderNoteButton } from './FounderNote'
import { PROJECT_EMAIL } from '../constants/contact'
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
                An IM residency program ranker built by and for Pakistani IMG applicants.
              </p>
            </div>
          </div>
          <FounderNoteButton onClick={() => setShowFounderNote(true)} compact />
        </div>
      </div>

      <DataDisclaimer variant="banner" />

      {/* What it is */}
      <Card title="What is ResidencyCompass?">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          ResidencyCompass is a free, browser-based tool that helps Pakistani International Medical Graduate (IMG) applicants
          score and rank Internal Medicine residency programs in the United States. You enter your profile — Step 2 CK score,
          visa need, ECFMG status, year of graduation, US clinical rotations, research, and personal connections — and the
          tool scores every program in the list based on how well your profile fits.
        </p>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          Programs are sorted into four tiers: <strong className="text-emerald-700 dark:text-emerald-400">TARGET</strong>,{' '}
          <strong className="text-blue-700 dark:text-blue-400">LIKELY</strong>,{' '}
          <strong className="text-amber-700 dark:text-amber-400">REACH</strong>, and{' '}
          <strong className="text-slate-600 dark:text-slate-400">LONG SHOT</strong> — so you can build a balanced,
          evidence-informed list rather than applying blindly to 100+ programs.
        </p>
      </Card>

      {/* Why it was built */}
      <Card title="Why was this built?">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          The US residency match is notoriously opaque for IMG applicants. While resources exist for US medical graduates,
          Pakistani IMGs face unique challenges: navigating visa sponsorship, demonstrating US clinical experience,
          managing the ECFMG certification timeline, and competing without the advantage of home-program connections.
        </p>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          Most Pakistani applicants rely on word-of-mouth, scattered WhatsApp groups, and incomplete spreadsheets to
          build their program lists. ResidencyCompass was built to bring that scattered knowledge together into a
          structured, personalised tool — one that understands the specific factors that matter for Pakistani IMGs,
          including Dow University match history, Pakistani graduate pipelines, and community program friendliness.
        </p>
      </Card>

      {/* How to use it */}
      <Card title="How to get the most out of it">
        <ol className="space-y-3 text-slate-600 dark:text-slate-400">
          {[
            { n: '1', title: 'Fill in your profile completely', desc: 'The more accurate your Step 2, YOG, visa status, and ECFMG status, the more meaningful the scores become.' },
            { n: '2', title: 'Add your connections', desc: 'Open each program card and log your connection strength. Even a weak connection can significantly shift a score.' },
            { n: '3', title: 'Use your signals wisely', desc: 'You have 3 Gold and 12 Silver signals. Use them on programs where you genuinely want to match — not just the most prestigious ones.' },
            { n: '4', title: 'Review the How Scoring Works tab', desc: 'Understanding the scoring weights helps you interpret results critically, not blindly.' },
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
          ResidencyCompass is built by Pakistani IMGs, for Pakistani IMGs. Want to help curate program data, improve
          the app, or spread the word? Visit the <strong>Community Data → Join the Team</strong> tab or email{' '}
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
