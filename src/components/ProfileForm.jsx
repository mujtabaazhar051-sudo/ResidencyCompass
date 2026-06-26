import { useState } from 'react'
import { PROFILE_COLLAPSE_KEY } from '../utils/profile'

const VISA_OPTIONS = [
  { value: 'none', label: 'No visa needed (US citizen / Green Card / EAD)' },
  { value: 'j1', label: 'J-1 Visa' },
  { value: 'h1b', label: 'H-1B Visa' },
  { value: 'either', label: 'J-1 or H-1B (either)' },
]

const ECFMG_OPTIONS = [
  { value: 'certified', label: 'ECFMG Certified' },
  { value: 'pending', label: 'Certification in progress' },
  { value: 'not', label: 'Not yet started' },
]

// Use 2-letter codes to match programs.json state field
const US_STATES = [
  { code: 'none', label: '— State —' },
  { code: 'AL', label: 'Alabama' },    { code: 'AK', label: 'Alaska' },
  { code: 'AZ', label: 'Arizona' },    { code: 'AR', label: 'Arkansas' },
  { code: 'CA', label: 'California' }, { code: 'CO', label: 'Colorado' },
  { code: 'CT', label: 'Connecticut' },{ code: 'DC', label: 'Washington DC' },
  { code: 'DE', label: 'Delaware' },   { code: 'FL', label: 'Florida' },
  { code: 'GA', label: 'Georgia' },    { code: 'HI', label: 'Hawaii' },
  { code: 'ID', label: 'Idaho' },      { code: 'IL', label: 'Illinois' },
  { code: 'IN', label: 'Indiana' },    { code: 'IA', label: 'Iowa' },
  { code: 'KS', label: 'Kansas' },     { code: 'KY', label: 'Kentucky' },
  { code: 'LA', label: 'Louisiana' },  { code: 'ME', label: 'Maine' },
  { code: 'MD', label: 'Maryland' },   { code: 'MA', label: 'Massachusetts' },
  { code: 'MI', label: 'Michigan' },   { code: 'MN', label: 'Minnesota' },
  { code: 'MS', label: 'Mississippi' },{ code: 'MO', label: 'Missouri' },
  { code: 'MT', label: 'Montana' },    { code: 'NE', label: 'Nebraska' },
  { code: 'NV', label: 'Nevada' },     { code: 'NH', label: 'New Hampshire' },
  { code: 'NJ', label: 'New Jersey' }, { code: 'NM', label: 'New Mexico' },
  { code: 'NY', label: 'New York' },   { code: 'NC', label: 'North Carolina' },
  { code: 'ND', label: 'North Dakota' },{ code: 'OH', label: 'Ohio' },
  { code: 'OK', label: 'Oklahoma' },   { code: 'OR', label: 'Oregon' },
  { code: 'PA', label: 'Pennsylvania' },{ code: 'RI', label: 'Rhode Island' },
  { code: 'SC', label: 'South Carolina' },{ code: 'SD', label: 'South Dakota' },
  { code: 'TN', label: 'Tennessee' },  { code: 'TX', label: 'Texas' },
  { code: 'UT', label: 'Utah' },       { code: 'VT', label: 'Vermont' },
  { code: 'VA', label: 'Virginia' },   { code: 'WA', label: 'Washington' },
  { code: 'WV', label: 'West Virginia' },{ code: 'WI', label: 'Wisconsin' },
  { code: 'WY', label: 'Wyoming' },
]

const RESEARCH_OPTIONS = [
  { value: 'multi_high', label: '2+ publications — high-impact journal' },
  { value: 'single_high', label: '1 publication — high-impact journal' },
  { value: 'multi_any', label: 'Multiple publications — any journal' },
  { value: 'single_any', label: '1 publication — any journal' },
  { value: 'presentations', label: 'Presentations / abstracts only' },
  { value: 'none', label: 'No research' },
]

const VISA_SHORT = { j1: 'J-1', h1b: 'H-1B', either: 'J-1/H-1B', none: 'No visa' }

function profileSummary(profile) {
  const parts = []
  if (profile.step2) parts.push(`Step 2: ${profile.step2}`)
  if (profile.visaNeed) parts.push(VISA_SHORT[profile.visaNeed] || profile.visaNeed)
  if (profile.medSchool === 'dow') parts.push('Dow')
  else if (profile.medSchool === 'other_pak') parts.push('Other Pak school')
  const rotCount = (profile.rotations || []).length
  if (rotCount) parts.push(`${rotCount} rotation${rotCount !== 1 ? 's' : ''}`)
  return parts.length ? parts.join(' · ') : 'No profile filled in yet'
}

export default function ProfileForm({
  profile,
  onChange,
  onApply,
  programs = [],
  isRanking = false,
  layout = 'panel',
  isOnboarding = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  sectionRef,
}) {
  const isTab = layout === 'tab'
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (isTab) return false
    try {
      return localStorage.getItem(PROFILE_COLLAPSE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const isControlled = !isTab && controlledCollapsed !== undefined
  const collapsed = isTab ? false : (isControlled ? controlledCollapsed : internalCollapsed)

  function setCollapsed(next) {
    if (isTab) return
    if (isControlled) onCollapsedChange?.(next)
    else setInternalCollapsed(next)
    try {
      localStorage.setItem(PROFILE_COLLAPSE_KEY, String(next))
    } catch {}
  }

  const formBody = (
      <div className={`${isTab ? 'px-5 pb-5 md:px-6 md:pb-6' : 'border-t border-slate-200 px-4 pb-4 pt-4 dark:border-slate-700 md:px-6 md:pb-6 md:pt-5'}`}>
        <div className="grid gap-4 md:grid-cols-2">

          {/* Scores row */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              USMLE Step 2 CK Score
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 238"
              value={profile.step2}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '').slice(0, 3)
                update('step2', val)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              USMLE Step 3{' '}
              <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <input
              type="text"
              placeholder="Score or leave blank if not taken"
              value={profile.step3}
              onChange={(e) => update('step3', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Year of Graduation{' '}
              <span className="font-normal text-slate-500">(medical school)</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2022"
              value={profile.yog || ''}
              onChange={(e) => update('yog', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
            {(() => {
              const yr = parseInt(profile.yog)
              if (!yr || yr < 1990 || yr > new Date().getFullYear()) return null
              const gap = new Date().getFullYear() - yr
              const penalty = gap >= 9 ? -20 : gap >= 6 ? -15 : gap >= 4 ? -8 : 0
              return (
                <p className={`mt-1 text-xs ${penalty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {gap} year{gap !== 1 ? 's' : ''} since graduation
                  {penalty < 0
                    ? ` · −${Math.abs(penalty)} pts applied to all programs`
                    : ' · no YOG penalty'}
                </p>
              )
            })()}
          </label>

          {/* Medical school */}
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pakistani Medical School</span>
            <div className="flex gap-3">
              {[
                { value: 'dow',       label: 'Dow University of Health Sciences (DIMC / DMC)' },
                { value: 'other_pak', label: 'Other Pakistani medical school' },
              ].map((o) => (
                <label key={o.value} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  profile.medSchool === o.value
                    ? 'border-blue-400 bg-blue-50 text-blue-800 font-medium dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="medSchool"
                    value={o.value}
                    checked={profile.medSchool === o.value}
                    onChange={() => update('medSchool', o.value)}
                    className="accent-blue-600"
                  />
                  {o.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Affects how Dow/Pak match history is scored — Dow grads get a stronger boost at programs with Dow pipelines
            </p>
          </label>

          {/* ECFMG + Visa */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">ECFMG Status</span>
            <select
              value={profile.ecfmg}
              onChange={(e) => update('ecfmg', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {ECFMG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Visa Need</span>
            <select
              value={profile.visaNeed}
              onChange={(e) => update('visaNeed', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {VISA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          {/* Rotations — dynamic list, each row = state + months */}
          <div className="md:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                US Clinical Rotations
                <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
                  (state match = small bonus per program)
                </span>
              </span>
              <button
                type="button"
                onClick={() => update('rotations', [...(profile.rotations || []), { state: 'none', months: 1 }])}
                className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                + Add rotation
              </button>
            </div>

            {(!profile.rotations || profile.rotations.length === 0) ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
                No rotations added — click "+ Add rotation" to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.rotations.map((rot, idx) => {
                  const updateRow = (patch) => {
                    const next = [...profile.rotations]
                    next[idx] = { ...next[idx], ...patch }
                    update('rotations', next)
                  }
                  const listedProg = programs.find((p) => p.program_code === rot.programCode)
                  const stateIsLocked = Boolean(listedProg) // auto-filled from listed program

                  return (
                    <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-600 dark:bg-slate-700/50">

                      {/* Program picker */}
                      <select
                        value={rot.programCode || ''}
                        onChange={(e) => {
                          const prog = programs.find((p) => p.program_code === e.target.value)
                          updateRow({
                            programCode: e.target.value,
                            state: prog ? prog.state : (rot.programCode ? 'none' : rot.state),
                          })
                        }}
                        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      >
                        <option value="">🏥 Other / Non-listed facility</option>
                          <optgroup label="Listed programs">
                            {[...programs].sort((a, b) => a.program_name.localeCompare(b.program_name)).map((p) => (
                              <option key={p.program_code} value={p.program_code}>
                                {p.program_name}
                              </option>
                            ))}
                          </optgroup>
                      </select>

                      {/* State — locked (auto-fill) or editable */}
                      {stateIsLocked ? (
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400" title="Auto-filled from program">
                          {rot.state}
                        </span>
                      ) : (
                        <select
                          value={rot.state || 'none'}
                          onChange={(e) => updateRow({ state: e.target.value })}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        >
                          {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>{s.label}</option>
                          ))}
                        </select>
                      )}

                      {/* Months */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rot.months}
                          onChange={(e) => updateRow({ months: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                          className="w-10 rounded-md border border-slate-300 bg-white px-1.5 py-1.5 text-center text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                          placeholder="0"
                          title="Months"
                        />
                        <span className="text-xs text-slate-400">mo</span>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => update('rotations', profile.rotations.filter((_, i) => i !== idx))}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Remove"
                      >✕</button>
                    </div>
                  )
                })}
                <p className="text-xs text-slate-400">
                  Total: {(profile.rotations || []).reduce((s, r) => s + (parseInt(r.months) || 0), 0)} months
                </p>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Research</span>
            <select
              value={profile.research}
              onChange={(e) => update('research', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {RESEARCH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          {/* Connections hint */}
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800 md:col-span-2 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
            <strong>Connections are set per program.</strong>{' '}
            {isTab
              ? <>On the <span className="font-semibold">Programs</span> tab, open any program card and use the Connection buttons to mark your strength and contact count at that program.</>
              : <>Open any program card below and use the{' '}
            <span className="font-semibold">🤝 Connection</span> buttons to mark your strength and contact count at that program.</>}
          </div>

        </div>

        {/* ECFMG warning */}
        {profile.ecfmg !== 'certified' && (
          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            profile.ecfmg === 'not'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            <p className="font-semibold">
              {profile.ecfmg === 'not' ? '⛔ ECFMG certification required' : '⚠️ ECFMG certification in progress'}
            </p>
            <p className="mt-0.5">
              {profile.ecfmg === 'not'
                ? 'ECFMG certification is required for ERAS submission as an IMG. Programs can technically review your application without it, but the vast majority will not consider uncertified applicants. A −10 deduction is applied to all program scores.'
                : 'You must complete ECFMG certification before the ERAS application deadline (typically early September). A −3 deduction is applied until certification is confirmed.'}
            </p>
          </div>
        )}

        {/* Apply button */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onApply}
            disabled={isRanking}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60"
          >
            {isRanking
              ? <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Ranking…</>
              : 'Update tier list'}
          </button>
        </div>
      </div>
  )

  function update(field, value) {
    onChange({ ...profile, [field]: value })
  }

  if (isTab) {
    return (
      <div ref={sectionRef} className="space-y-5">
        {isOnboarding && (
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-5 py-4 dark:border-blue-800 dark:from-blue-950/40 dark:to-slate-800 md:px-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Welcome to ResidencyCompass</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Fill in your profile below — at minimum your Step 2 CK score. Programs rank in the background; you stay on this tab until you choose Programs.
            </p>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:px-6 md:py-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Profile</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isOnboarding
              ? 'Add your Step 2 score, visa type, ECFMG status, med school, and year of graduation. When you are done, click Update tier list or open the Programs tab.'
              : 'Set this once at the start of the season. When you change Step 2, visa, rotations, or research, click Update tier list — then browse programs on the Programs tab.'}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{profileSummary(profile)}</p>
        </div>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {formBody}
        </section>
      </div>
    )
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed)
  }

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 md:px-6 md:py-4"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Profile</h2>
          <p className={`text-sm ${collapsed ? 'truncate text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {collapsed ? profileSummary(profile) : 'Edit your details, then click Update tier list'}
          </p>
        </div>
        <span className="shrink-0 text-sm text-slate-400" aria-hidden="true">{collapsed ? '▼' : '▲'}</span>
      </button>

      {!collapsed && formBody}
    </section>
  )
}
