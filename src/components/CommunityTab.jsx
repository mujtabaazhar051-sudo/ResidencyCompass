import { useEffect, useState } from 'react'
import DataDisclaimer from './DataDisclaimer'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchSubmissionCounts, submitCommunityReport, submitConnectionReport, submitIvReport } from '../lib/community'

const CYCLES = ['2026–27', '2025–26', '2024–25', '2023–24']

const MED_SCHOOLS = [
  { value: 'dow',       label: 'Dow University of Health Sciences (DIMC / DMC)' },
  { value: 'other_pak', label: 'Other Pakistani medical school' },
  { value: 'other_img', label: 'Other IMG (non-Pakistani)' },
]

const VISA_OPTIONS = [
  { value: 'j1',   label: 'J-1 Visa' },
  { value: 'h1b',  label: 'H-1B Visa' },
  { value: 'none', label: 'No visa needed (US citizen / PR / EAD)' },
  { value: 'other', label: 'Other' },
]

const RESEARCH_OPTIONS = [
  { value: 'multi_high', label: '2+ publications — high-impact journal' },
  { value: 'single_high', label: '1 publication — high-impact journal' },
  { value: 'multi_any', label: 'Multiple publications — any journal' },
  { value: 'single_any', label: '1 publication — any journal' },
  { value: 'presentations', label: 'Presentations / abstracts only' },
  { value: 'none', label: 'No research' },
]

const CONNECTION_OPTIONS = [
  { value: 'none', label: 'No connection', hint: 'No contact at this program' },
  { value: 'weak', label: 'Weak', hint: 'Peripheral / second-degree' },
  { value: 'moderate', label: 'Moderate', hint: 'Met them, exchanged emails' },
  { value: 'strong', label: 'Strong', hint: 'Direct mentor, PD, or faculty' },
]

const EMPTY_IV_FORM = {
  program_code: '',
  cycle: CYCLES[0],
  step2: '',
  step3: '',
  med_school: 'dow',
  yog: '',
  visa: 'j1',
  research: 'none',
  rotation_months: '',
  got_invite: '',
  signal: '',
  connection: '',
  notes: '',
  contact: '',
}

const EMPTY_CONNECTION_FORM = {
  program_code: '',
  cycle: CYCLES[0],
  connection: '',
  notes: '',
  contact: '',
}

function ConnectionStrengthPicker({ name, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {CONNECTION_OPTIONS.map((o) => (
        <label
          key={o.value}
          title={o.hint}
          className={`flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 text-sm transition-colors ${
            value === o.value
              ? o.value === 'strong'
                ? 'border-violet-400 bg-violet-50 font-semibold text-violet-900 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200'
                : o.value === 'moderate'
                ? 'border-blue-400 bg-blue-50 font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                : o.value === 'weak'
                ? 'border-orange-400 bg-orange-50 font-semibold text-orange-900 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-200'
                : 'border-slate-400 bg-slate-50 font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="accent-blue-600"
            />
            {o.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function ProgramSelect({ programs, value, onChange, required = true }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Program {required && <span className="text-red-500">*</span>}
      </span>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      >
        <option value="">— Select program —</option>
        {programs.map((p) => (
          <option key={p.program_code} value={p.program_code}>{p.program_name} ({p.state})</option>
        ))}
      </select>
    </label>
  )
}

const REPORT_TYPES = [
  { value: 'error',      label: '🐛 Incorrect program data' },
  { value: 'question',   label: '❓ Question about the tool' },
  { value: 'suggestion', label: '💡 Feature suggestion' },
  { value: 'other',      label: '📬 Other' },
]

function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      <p className="font-semibold">Community submissions temporarily unavailable</p>
      <p className="mt-1 leading-relaxed">
        Interview reports and program feedback are offline right now. Your tier list, signals, and notes still work in your browser.
      </p>
    </div>
  )
}

function IVReportForm({ programs, userId, onSubmitted }) {
  const [form, setForm] = useState({ ...EMPTY_IV_FORM })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.program_code || !form.step2 || !form.got_invite || !form.signal || !form.connection) return
    setStatus('loading')
    try {
      const program = programs.find((p) => p.program_code === form.program_code)
      await submitIvReport(
        { ...form, program_name: program?.program_name ?? form.program_code },
        userId,
      )
      setStatus('success')
      onSubmitted?.()
      setForm({ ...EMPTY_IV_FORM })
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (!isSupabaseConfigured) return <SetupNotice />

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 font-semibold text-emerald-800 dark:text-emerald-200">Thank you for submitting!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Saved to the community database for review.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-lg border border-emerald-300 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ProgramSelect
          programs={programs}
          value={form.program_code}
          onChange={(v) => update('program_code', v)}
        />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Application Cycle</span>
          <select
            value={form.cycle}
            onChange={(e) => update('cycle', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Step 2 CK Score <span className="text-red-500">*</span></span>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="e.g. 242"
            value={form.step2}
            onChange={(e) => update('step2', e.target.value.replace(/\D/g, '').slice(0, 3))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            USMLE Step 3 <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            type="text"
            placeholder="Score or leave blank if not taken"
            value={form.step3}
            onChange={(e) => update('step3', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Medical School</span>
          <select
            value={form.med_school}
            onChange={(e) => update('med_school', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {MED_SCHOOLS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Year of Graduation <span className="font-normal text-slate-400">(optional)</span></span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2022"
            value={form.yog}
            onChange={(e) => update('yog', e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Visa Status</span>
          <select
            value={form.visa}
            onChange={(e) => update('visa', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {VISA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Research</span>
          <select
            value={form.research}
            onChange={(e) => update('research', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {RESEARCH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            US clinical rotation months <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 3 — total months across all rotations"
            value={form.rotation_months}
            onChange={(e) => update('rotation_months', e.target.value.replace(/\D/g, '').slice(0, 2))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <div className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Did you receive an interview invite? <span className="text-red-500">*</span></span>
          <div className="flex gap-3">
            {[
              { value: 'yes', label: '✓ Yes — got the invite' },
              { value: 'no',  label: '✗ No — did not get one' },
            ].map((o) => (
              <label
                key={o.value}
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  form.got_invite === o.value
                    ? o.value === 'yes'
                      ? 'border-emerald-400 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'border-rose-400 bg-rose-50 font-semibold text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="got_invite"
                  value={o.value}
                  checked={form.got_invite === o.value}
                  onChange={() => update('got_invite', o.value)}
                  className="accent-blue-600"
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Did you signal this program? <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'gold', label: 'Gold signal' },
              { value: 'silver', label: 'Silver signal' },
              { value: 'none', label: 'No signal' },
            ].map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  form.signal === o.value
                    ? o.value === 'gold'
                      ? 'border-yellow-400 bg-yellow-50 font-semibold text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200'
                      : o.value === 'silver'
                      ? 'border-slate-400 bg-slate-100 font-semibold text-slate-800 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200'
                      : 'border-slate-400 bg-slate-50 font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="signal"
                  value={o.value}
                  checked={form.signal === o.value}
                  onChange={() => update('signal', o.value)}
                  className="accent-blue-600"
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Connection at this program <span className="text-red-500">*</span>
          </span>
          <ConnectionStrengthPicker
            name="iv_connection"
            value={form.connection}
            onChange={(v) => update('connection', v)}
          />
        </div>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Additional notes <span className="font-normal text-slate-400">(optional)</span></span>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="font-normal text-slate-400">(optional)</span></span>
          <input
            type="email"
            value={form.contact}
            onChange={(e) => update('contact', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Submission failed. Check your connection and try again. If this is a new form field, run the latest SQL migration in Supabase.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'loading' || !form.program_code || !form.step2 || !form.got_invite || !form.signal || !form.connection}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </form>
  )
}

function ConnectionReportForm({ programs, userId, onSubmitted }) {
  const [form, setForm] = useState({ ...EMPTY_CONNECTION_FORM })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.program_code || !form.connection) return
    setStatus('loading')
    try {
      const program = programs.find((p) => p.program_code === form.program_code)
      await submitConnectionReport(
        { ...form, program_name: program?.program_name ?? form.program_code },
        userId,
      )
      setStatus('success')
      onSubmitted?.()
      setForm({ ...EMPTY_CONNECTION_FORM })
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (!isSupabaseConfigured) return <SetupNotice />

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 font-semibold text-emerald-800 dark:text-emerald-200">Thank you for submitting!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Connection report saved for review.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-lg border border-emerald-300 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ProgramSelect
          programs={programs}
          value={form.program_code}
          onChange={(v) => update('program_code', v)}
        />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Application Cycle</span>
          <select
            value={form.cycle}
            onChange={(e) => update('cycle', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <div className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Do you have a connection at this program? <span className="text-red-500">*</span>
          </span>
          <ConnectionStrengthPicker
            name="connection_report"
            value={form.connection}
            onChange={(v) => update('connection', v)}
          />
        </div>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Details <span className="font-normal text-slate-400">(optional — e.g. who you know, how you met)</span>
          </span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="e.g. Met PD at conference, email with chief resident…"
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="font-normal text-slate-400">(optional)</span></span>
          <input
            type="email"
            value={form.contact}
            onChange={(e) => update('contact', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Submission failed. Run the latest SQL migration in Supabase if you have not already.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'loading' || !form.program_code || !form.connection}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Connection Report'}
        </button>
      </div>
    </form>
  )
}

function ReportForm({ programs, userId, onSubmitted }) {
  const [form, setForm] = useState({ type: 'error', program_code: '', description: '', contact: '' })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim()) return
    setStatus('loading')
    try {
      const program = programs.find((p) => p.program_code === form.program_code)
      await submitCommunityReport(
        { ...form, program_name: program?.program_name ?? '' },
        userId,
      )
      setStatus('success')
      onSubmitted?.()
      setForm({ type: 'error', program_code: '', description: '', contact: '' })
    } catch {
      setStatus('error')
    }
  }

  if (!isSupabaseConfigured) return <SetupNotice />

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-semibold text-emerald-800 dark:text-emerald-200">Received — thanks!</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-lg border border-emerald-300 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</span>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                form.type === t.value
                  ? 'border-blue-400 bg-blue-50 font-medium text-blue-800 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-400'
              }`}
            >
              <input type="radio" name="report_type" value={t.value} checked={form.type === t.value} onChange={() => update('type', t.value)} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Program <span className="font-normal text-slate-400">(optional)</span></span>
        <select
          value={form.program_code}
          onChange={(e) => update('program_code', e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          <option value="">— Not program-specific —</option>
          {programs.map((p) => (
            <option key={p.program_code} value={p.program_code}>{p.program_name} ({p.state})</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description <span className="text-red-500">*</span></span>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="font-normal text-slate-400">(optional)</span></span>
        <input
          type="email"
          value={form.contact}
          onChange={(e) => update('contact', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </label>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">Submission failed — try again.</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'loading' || !form.description.trim()}
          className="rounded-lg bg-slate-800 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-700"
        >
          {status === 'loading' ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}

function DemoSignInNotice({ onCreateAccount }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <p className="font-semibold text-slate-800 dark:text-slate-200">Sign in to submit community reports</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Demo mode lets you explore the ranker without an account. Create an account to save your list and contribute interview data.
      </p>
      <button
        type="button"
        onClick={onCreateAccount}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Create account
      </button>
    </div>
  )
}

export default function CommunityTab({ programs, demoMode = false, onCreateAccount }) {
  const { userId, isConfigured, isAuthenticated } = useAuth()
  const [activeForm, setActiveForm] = useState('iv')
  const [counts, setCounts] = useState({ iv: 0, reports: 0, connections: 0 })

  async function refreshCounts() {
    if (!isConfigured || !userId || userId === 'local') return
    const next = await fetchSubmissionCounts(userId)
    setCounts(next)
  }

  useEffect(() => {
    refreshCounts()
  }, [userId, isConfigured]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-950/40">
        <h2 className="font-semibold text-blue-900 dark:text-blue-200">Help build Pakistani IMG data</h2>
        <p className="mt-1 text-sm text-blue-800 dark:text-blue-300/90">
          Submissions are stored in Supabase, reviewed manually, and may update program medians over time. Not official NRMP or AAMC data.
        </p>
        {isConfigured && userId && userId !== 'local' && (
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
            Your submissions: {counts.iv} IV report{counts.iv !== 1 ? 's' : ''}, {counts.connections} connection report{counts.connections !== 1 ? 's' : ''}, {counts.reports} other report{counts.reports !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <DataDisclaimer variant="banner" />

      <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:flex-row dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setActiveForm('iv')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'iv' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Interview Report
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('connection')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'connection' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Connection Report
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('report')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'report' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Error / Question
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {demoMode || !isAuthenticated ? (
          <DemoSignInNotice onCreateAccount={onCreateAccount} />
        ) : activeForm === 'iv' ? (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Interview Invite Report</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Share whether you received an interview — include Step 2/3, signal type, and connection strength at that program.
            </p>
            <IVReportForm programs={programs} userId={userId} onSubmitted={refreshCounts} />
          </>
        ) : activeForm === 'connection' ? (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Connection Report</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Tell the community whether you have a connection at a program — even if you have not applied or interviewed yet.
            </p>
            <ConnectionReportForm programs={programs} userId={userId} onSubmitted={refreshCounts} />
          </>
        ) : (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Report an Error or Ask a Question</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Wrong program data, scoring questions, or feature ideas.
            </p>
            <ReportForm programs={programs} userId={userId} onSubmitted={refreshCounts} />
          </>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <h4 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">What happens to submitted data?</h4>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>Reports are saved to Supabase and reviewed before updating the public program list.</li>
          <li>Individual submissions are never shown on program cards — only aggregated stats after review.</li>
          <li>View all submissions in Supabase Table Editor (project owner only).</li>
        </ul>
      </div>
    </div>
  )
}
