import { DISCLAIMER_BULLETS } from '../utils/dataSources'

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 border-b border-slate-200 pb-1 text-base font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-700/50">
            {headers.map((h) => (
              <th key={h} className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-800 dark:even:bg-slate-800/50">
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-600 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pill({ label, color }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    blue:    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    amber:   'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    slate:   'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  }
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[color]}`}>
      {label}
    </span>
  )
}

export default function ScoringTab() {
  return (
    <div className="space-y-6">

      {/* Intro */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h2 className="font-semibold text-blue-900 dark:text-blue-200">How programs are scored</h2>
        <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
          Every program gets a score from <strong>0 to 100</strong> and a tier based on how well your profile fits.
          Scores are calculated entirely in your browser — nothing is sent anywhere.
          The tool is tuned specifically for <strong>Pakistani IMG applicants</strong> applying to Internal Medicine.
        </p>
      </div>

      {/* Tier thresholds */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Section title="Tiers">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Programs are grouped into four tiers based on their final score:</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'TARGET  ≥ 65',    color: 'emerald', note: 'Strong fit — worth prioritising' },
              { label: 'LIKELY  ≥ 38',    color: 'blue',    note: 'Good chance — apply broadly' },
              { label: 'REACH   ≥ 20',    color: 'amber',   note: 'Low odds — still worth a shot' },
              { label: 'LONG SHOT < 20',  color: 'slate',   note: 'Very unlikely — decide carefully' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <Pill label={t.label} color={t.color} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <strong>Connection override:</strong> any program where you have a Strong connection (≥ 28 pts) or 2+ Moderate contacts (≥ 26 pts combined) is automatically promoted to TARGET regardless of score.
          </p>
        </Section>
      </div>

      {/* Score components */}
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Score components</h3>
        <p className="-mt-4 text-sm text-slate-500 dark:text-slate-400">The final score is the sum of all components below, clamped to 0–100.</p>

        {/* 1 · Step 2 */}
        <Section title="1 · Step 2 CK Fit  (max +27)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Your Step 2 score is compared against each program's median and crowdsourced data.</p>
          <Table
            headers={['Situation', 'Points']}
            rows={[
              ['Well above program average (+8 or more)', '+27'],
              ['Above stated cutoff / above average', '+23'],
              ['On par with program average (±8)', '+14'],
              ['Below program average', '+2'],
              ['No program data / score not entered', '+10'],
            ]}
          />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">A 15-point Step 2 difference typically shifts a program by at least one tier.</p>
        </Section>

        {/* 2 · Dow / Pak */}
        <Section title="2 · Dow / Pak Match History  (max +22)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Points depend on whether you attended Dow (DIMC/DMC) or another Pakistani school.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Dow graduate</p>
              <Table
                headers={['Program history', 'Points']}
                rows={[
                  ['Both Dow + Pakistani matched', '+22'],
                  ['Dow graduates matched', '+16'],
                  ['Pakistani matched (not Dow-specific)', '+10'],
                  ['Uncertain / not confirmed', '+2'],
                  ['No history', '0'],
                ]}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Other Pakistani school</p>
              <Table
                headers={['Program history', 'Points']}
                rows={[
                  ['Pakistani graduates matched', '+10'],
                  ['Only Dow graduates matched', '+4'],
                  ['Uncertain / not confirmed', '+2'],
                  ['No history', '0'],
                ]}
              />
            </div>
          </div>
        </Section>

        {/* 3 · Connections */}
        <Section title="3 · Personal Connections  (max +28 + tier override)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Set per program using the connection buttons on each card.</p>
          <Table
            headers={['Strength', 'Base points', 'Description']}
            rows={[
              ['Strong',   '+28', 'Direct mentor, PD, close faculty — auto-promotes to TARGET'],
              ['Moderate', '+16', 'Met them, exchanged emails'],
              ['Weak',     '+7',  'Peripheral or second-degree contact'],
            ]}
          />
          <div className="mt-2">
            <Table
              headers={['Contact count bonus', 'Points']}
              rows={[
                ['2 contacts at the same program', '+4'],
                ['3+ contacts at the same program', '+6'],
              ]}
            />
          </div>
        </Section>

        {/* 4 · No-visa */}
        <Section title="4 · No-Visa Status  (flat +12)">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            US citizens, green card holders, and EAD holders receive a flat <strong>+12</strong> across every program.
            Programs that don't sponsor visas also become visible and available.
          </p>
        </Section>

        {/* 5 · Rotations */}
        <Section title="5 · US Clinical Rotations  (max +17)">
          <Table
            headers={['Total months', 'Points']}
            rows={[
              ['6+ months', '+7'],
              ['3–5 months', '+5'],
              ['1–2 months', '+3'],
              ['None', '0'],
            ]}
          />
          <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <p>+ <strong>2 pts</strong> if the rotation state matches the program's state</p>
            <p>+ <strong>10 pts</strong> if the rotation was done at this specific listed program (replaces state bonus)</p>
          </div>
        </Section>

        {/* 6 · Research */}
        <Section title="6 · Research  (max +13, scaled by program type)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            Base research points are multiplied by the program type: <strong>University ×1.0</strong>, Affiliated ×0.6, Community ×0.3.
          </p>
          <Table
            headers={['Research level', 'Base points']}
            rows={[
              ['2+ publications — high-impact journal', '13'],
              ['1 publication — high-impact journal', '9'],
              ['Multiple publications — any journal', '6'],
              ['1 publication — any journal', '4'],
              ['Presentations / abstracts only', '2'],
              ['No research', '0'],
            ]}
          />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Example: 2+ high-impact papers at a community program = 13 × 0.3 = 4 pts. Same at a university = 13 pts.
          </p>
        </Section>

        {/* 7 · Program type */}
        <Section title="7 · Program Type  (max +8)">
          <Table
            headers={['Type', 'Points']}
            rows={[
              ['Community', '+8'],
              ['Affiliated / teaching hospital', '+6'],
              ['University', '+2'],
            ]}
          />
        </Section>

        {/* 8 · ECFMG */}
        <Section title="8 · ECFMG Certification  (−10 to +4)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            Required for ERAS submission. Programs can technically see uncertified applications but most will not consider them.
          </p>
          <Table
            headers={['Status', 'Points']}
            rows={[
              ['Certified', '+4'],
              ['Certification in progress', '−3'],
              ['Not yet started', '−10'],
            ]}
          />
        </Section>

        {/* 9 · YOG */}
        <Section title="9 · Year of Graduation Gap  (−20 to 0)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Applied flat to every program based on years since medical school graduation.</p>
          <Table
            headers={['Years since graduation', 'Penalty']}
            rows={[
              ['0–3 years', '0'],
              ['4–5 years', '−8'],
              ['6–8 years', '−15'],
              ['9+ years', '−20'],
            ]}
          />
        </Section>

        {/* 10 · Signal */}
        <Section title="10 · Per-Program Signal  (max +8)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            You have a budget of <strong>3 Gold</strong> and <strong>12 Silver</strong> signals (15 total).
            Set them on each program card. Points depend on whether the program requires or benefits from signals.
          </p>
          <Table
            headers={['Signal policy', 'Gold signal', 'Silver signal', 'No signal']}
            rows={[
              ['Signals required',  '+8', '+5', '0'],
              ['Signals help',      '+6', '+4', '+3'],
              ['Neutral policy',    '+5', '+5', '+5'],
            ]}
          />
        </Section>

        {/* 11 · Penalties */}
        <Section title="11 · Per-Program Penalty Flags  (−14 to 0)">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Deductions based on flags found in a program's notes. Total capped at −14.</p>
          <Table
            headers={['Flag', 'Penalty']}
            rows={[
              ['No IMG / not IMG-friendly',  '−14'],
              ['YOG restriction mentioned',  '−10'],
              ['Marked very competitive',    '−5'],
              ['Filled via SOAP',            '−4'],
            ]}
          />
        </Section>

        {/* 12 · Step 3 */}
        <Section title="12 · USMLE Step 3  (bonus +4)">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A small bonus if Step 3 has been passed. No penalty for not having it — it's an optional differentiator.
          </p>
        </Section>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <h4 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Important disclaimer</h4>
        <ul className="list-disc space-y-1 pl-4">
          {DISCLAIMER_BULLETS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

    </div>
  )
}
