import { useEffect, useMemo, useState } from 'react'
import DataDisclaimer from './DataDisclaimer'
import ProgramSearchPicker, { UNLISTED_PROGRAM_CODE } from './ProgramSearchPicker'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchPublicIvReports, fetchSubmissionCounts, submitCommunityReport, submitIvReport, submitJoinTeamApplication } from '../lib/community'
import { PROJECT_EMAIL } from '../constants/contact'
import { sortProgramsByName } from '../utils/sortPrograms'

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
  custom_program_name: '',
  custom_program_state: '',
  custom_nrmp_code: '',
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


const REPORT_TYPES = [
  { value: 'error',      label: '🐛 Incorrect program data' },
  { value: 'question',   label: '❓ Question about the tool' },
  { value: 'suggestion', label: '💡 Feature suggestion' },
  { value: 'other',      label: '📬 Other' },
]

const TEAM_INTERESTS = [
  { value: 'data', label: 'Program data curation' },
  { value: 'dev', label: 'Web / app development' },
  { value: 'outreach', label: 'Outreach & social media' },
  { value: 'iv_data', label: 'Interview data collection' },
  { value: 'other', label: 'Other' },
]

const EMPTY_JOIN_FORM = { name: '', email: '', interest: 'data', message: '' }

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

function IVReportForm({ programs, userId, onSubmitted, onSwitchToReport }) {
  const [form, setForm] = useState({ ...EMPTY_IV_FORM })
  const [status, setStatus] = useState('idle')

  const sortedPrograms = useMemo(() => sortProgramsByName(programs), [programs])
  const isUnlisted = form.program_code === UNLISTED_PROGRAM_CODE

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateUnlisted(patch) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function isProgramValid() {
    if (isUnlisted) {
      return Boolean(form.custom_program_name.trim() && form.custom_program_state)
    }
    return Boolean(form.program_code)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isProgramValid() || !form.step2 || !form.got_invite || !form.signal || !form.connection) return
    setStatus('loading')
    try {
      let program_code = form.program_code
      let program_name
      let notes = form.notes?.trim() || null

      if (isUnlisted) {
        const name = form.custom_program_name.trim()
        const state = form.custom_program_state
        program_name = `${name} (${state})`
        program_code = form.custom_nrmp_code.trim() || `unlisted:${Date.now()}`
        if (form.custom_nrmp_code.trim()) {
          notes = notes
            ? `${notes}\n\nUser-provided NRMP code: ${form.custom_nrmp_code.trim()}`
            : `User-provided NRMP code: ${form.custom_nrmp_code.trim()}`
        }
      } else {
        const program = sortedPrograms.find((p) => p.program_code === form.program_code)
        program_name = program?.program_name ?? form.program_code
      }

      await submitIvReport(
        { ...form, program_code, program_name, notes },
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
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Visible to other users in Browse Reports (your email stays private).</p>
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
        <ProgramSearchPicker
          programs={sortedPrograms}
          value={form.program_code}
          onChange={(v) => update('program_code', v)}
          unlisted={{
            custom_program_name: form.custom_program_name,
            custom_program_state: form.custom_program_state,
            custom_nrmp_code: form.custom_nrmp_code,
          }}
          onUnlistedChange={updateUnlisted}
          onSwitchToReport={onSwitchToReport}
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
          disabled={status === 'loading' || !isProgramValid() || !form.step2 || !form.got_invite || !form.signal || !form.connection}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </form>
  )
}

function ReportForm({ programs, userId, onSubmitted }) {
  const sortedPrograms = useMemo(() => sortProgramsByName(programs), [programs])
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
      const program = sortedPrograms.find((p) => p.program_code === form.program_code)
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
          {sortedPrograms.map((p) => (
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

const MED_SCHOOL_LABELS = Object.fromEntries(MED_SCHOOLS.map((o) => [o.value, o.label]))
const VISA_LABELS = Object.fromEntries(VISA_OPTIONS.map((o) => [o.value, o.label]))
const RESEARCH_LABELS = Object.fromEntries(RESEARCH_OPTIONS.map((o) => [o.value, o.label]))
const CONNECTION_LABELS = Object.fromEntries(CONNECTION_OPTIONS.map((o) => [o.value, o.label]))
const SIGNAL_LABELS = { gold: 'Gold signal', silver: 'Silver signal', none: 'No signal' }

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function IvReportsBrowse({ programs }) {
  const sortedPrograms = useMemo(() => sortProgramsByName(programs), [programs])
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('loading')
  const [programFilter, setProgramFilter] = useState('')
  const [cycleFilter, setCycleFilter] = useState('')
  const [inviteFilter, setInviteFilter] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unavailable')
      return
    }

    let cancelled = false
    setStatus('loading')

    fetchPublicIvReports({
      programCode: programFilter || undefined,
      cycle: cycleFilter || undefined,
      gotInvite: inviteFilter || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setReports(data)
          setStatus('ready')
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [programFilter, cycleFilter, inviteFilter])

  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Interview reports submitted by the community. Submitter emails are never shown.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Program</span>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All programs</option>
            {sortedPrograms.map((p) => (
              <option key={p.program_code} value={p.program_code}>{p.program_name} ({p.state})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Cycle</span>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All cycles</option>
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Interview outcome</span>
          <select
            value={inviteFilter}
            onChange={(e) => setInviteFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All outcomes</option>
            <option value="yes">Got interview</option>
            <option value="no">No interview</option>
          </select>
        </label>
      </div>

      {status === 'loading' && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading reports…</p>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Could not load reports. If this is a new feature, run <code className="text-xs">migration_iv_reports_public.sql</code> in Supabase SQL Editor.
        </div>
      )}

      {status === 'ready' && reports.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No reports yet — be the first to submit one.</p>
      )}

      {status === 'ready' && reports.length > 0 && (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3 md:hidden">
            {reports.map((r) => (
              <article key={r.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{r.program_name || r.program_code}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.got_invite === 'yes'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                  }`}>
                    {r.got_invite === 'yes' ? 'II received' : 'No II'}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div><dt className="inline font-medium">Cycle: </dt><dd className="inline">{r.cycle || '—'}</dd></div>
                  <div><dt className="inline font-medium">Step 2: </dt><dd className="inline">{r.step2}</dd></div>
                  {r.step3 && <div><dt className="inline font-medium">Step 3: </dt><dd className="inline">{r.step3}</dd></div>}
                  <div><dt className="inline font-medium">Signal: </dt><dd className="inline">{SIGNAL_LABELS[r.signal] || r.signal}</dd></div>
                  <div><dt className="inline font-medium">Connection: </dt><dd className="inline">{CONNECTION_LABELS[r.connection] || r.connection}</dd></div>
                  <div className="col-span-2"><dt className="inline font-medium">School: </dt><dd className="inline">{MED_SCHOOL_LABELS[r.med_school] || r.med_school || '—'}</dd></div>
                </dl>
                {r.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{r.notes}</p>}
                <p className="mt-2 text-[10px] text-slate-400">{formatDate(r.created_at)}</p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  <th className="px-2 py-2">Program</th>
                  <th className="px-2 py-2">Cycle</th>
                  <th className="px-2 py-2">Step 2</th>
                  <th className="px-2 py-2">Outcome</th>
                  <th className="px-2 py-2">Signal</th>
                  <th className="px-2 py-2">Connection</th>
                  <th className="px-2 py-2">Profile</th>
                  <th className="px-2 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {reports.map((r) => (
                  <tr key={r.id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-2 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                      <div>{r.program_name || r.program_code}</div>
                      {r.notes && <div className="mt-0.5 max-w-xs truncate text-xs font-normal text-slate-500 dark:text-slate-400" title={r.notes}>{r.notes}</div>}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap">{r.cycle || '—'}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap">{r.step2}{r.step3 ? ` / ${r.step3}` : ''}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.got_invite === 'yes'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                      }`}>
                        {r.got_invite === 'yes' ? 'II' : 'No II'}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-xs">{SIGNAL_LABELS[r.signal] || r.signal}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-xs">{CONNECTION_LABELS[r.connection] || r.connection}</td>
                    <td className="px-2 py-2.5 text-xs">
                      <div>{MED_SCHOOL_LABELS[r.med_school] || r.med_school || '—'}</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {[VISA_LABELS[r.visa], RESEARCH_LABELS[r.research], r.yog ? `YOG ${r.yog}` : null, r.rotation_months ? `${r.rotation_months}mo rotations` : null]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-xs text-slate-500">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function JoinTeamForm({ userId, isAuthenticated, userEmail, onCreateAccount, onSubmitted }) {
  const [form, setForm] = useState({ ...EMPTY_JOIN_FORM, email: userEmail ?? '' })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return

    const interestLabel = TEAM_INTERESTS.find((o) => o.value === form.interest)?.label ?? form.interest
    setStatus('loading')

    try {
      if (isAuthenticated && userId && userId !== 'local' && isSupabaseConfigured) {
        await submitJoinTeamApplication({ ...form, interestLabel }, userId)
        setStatus('success')
        onSubmitted?.()
        setForm({ ...EMPTY_JOIN_FORM, email: userEmail ?? '' })
        return
      }

      const subject = encodeURIComponent('ResidencyCompass — Join the team')
      const body = encodeURIComponent(
        `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\nInterest: ${interestLabel}\n\n${form.message.trim()}`,
      )
      window.location.href = `mailto:${PROJECT_EMAIL}?subject=${subject}&body=${body}`
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (!isSupabaseConfigured && import.meta.env.PROD) return <SetupNotice />

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-2xl">🙌</p>
        <p className="mt-2 font-semibold text-emerald-800 dark:text-emerald-200">Thanks for reaching out!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          {isAuthenticated
            ? 'Your application was saved. We will get back to you soon.'
            : 'Your email app should open — send the message to complete your application.'}
        </p>
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
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        ResidencyCompass is a community project. Help us grow program data, improve the tool, or spread the word to
        other Pakistani IMGs. Questions? Email{' '}
        <a href={`mailto:${PROJECT_EMAIL}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          {PROJECT_EMAIL}
        </a>
        .
      </p>

      {!isAuthenticated && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
          Signed in? Your application saves to our database. As a guest, submit opens your email app to{' '}
          <span className="font-medium">{PROJECT_EMAIL}</span>.{' '}
          <button type="button" onClick={onCreateAccount} className="font-semibold text-blue-600 dark:text-blue-400">
            Create account
          </button>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">How would you like to help?</span>
        <select
          value={form.interest}
          onChange={(e) => update('interest', e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          {TEAM_INTERESTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tell us about yourself <span className="text-red-500">*</span>
        </span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Your background, time you can offer, skills, or ideas…"
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </label>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">Submission failed — try again or email us directly.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Or email directly:{' '}
          <a href={`mailto:${PROJECT_EMAIL}`} className="font-medium text-blue-600 dark:text-blue-400">{PROJECT_EMAIL}</a>
        </p>
        <button
          type="submit"
          disabled={status === 'loading' || !form.name.trim() || !form.email.trim() || !form.message.trim()}
          className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending…' : 'Apply to join'}
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
  const { userId, isConfigured, isAuthenticated, user } = useAuth()
  const [activeForm, setActiveForm] = useState('iv')
  const [counts, setCounts] = useState({ iv: 0, reports: 0 })

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
          Submit interview outcomes or browse what others have shared. Submitter emails are never shown publicly.
        </p>
        {isConfigured && userId && userId !== 'local' && (
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
            Your submissions: {counts.iv} IV report{counts.iv !== 1 ? 's' : ''}, {counts.reports} other report{counts.reports !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <DataDisclaimer variant="banner" />

      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setActiveForm('iv')}
          className={`min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'iv' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Interview Report
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('browse')}
          className={`min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'browse' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Browse Reports
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('report')}
          className={`min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'report' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Error / Question
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('join')}
          className={`min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            activeForm === 'join' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Join the Team
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {activeForm === 'browse' ? (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Community Interview Reports</h3>
            <IvReportsBrowse programs={programs} />
          </>
        ) : activeForm === 'join' ? (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Join the Team</h3>
            <JoinTeamForm
              userId={userId}
              isAuthenticated={isAuthenticated && !demoMode}
              userEmail={user?.email}
              onCreateAccount={onCreateAccount}
              onSubmitted={refreshCounts}
            />
          </>
        ) : demoMode || !isAuthenticated ? (
          <DemoSignInNotice onCreateAccount={onCreateAccount} />
        ) : activeForm === 'iv' ? (
          <>
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Interview Invite Report</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Share whether you received an interview — include Step 2/3, signal type, and connection strength at that program.
            </p>
            <IVReportForm
              programs={programs}
              userId={userId}
              onSubmitted={refreshCounts}
              onSwitchToReport={() => setActiveForm('report')}
            />
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
          <li>Interview reports appear in Browse Reports for all users — emails are never shown.</li>
          <li>Program card medians and crowdsourced notes are still updated manually when needed.</li>
          <li>You can edit or remove rows anytime in Supabase Table Editor (project owner).</li>
        </ul>
      </div>
    </div>
  )
}
