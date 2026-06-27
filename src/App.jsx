import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import defaultPrograms from './data/programs.json'
import defaultInitialState from './data/initialState.json'
import { scorePrograms, TIER_ORDER, SIGNAL_MAX, SIGNAL_MAX_GOLD, SIGNAL_MAX_SILVER } from './scoring/engine'
import ProfileForm from './components/ProfileForm'
import FilterBar from './components/FilterBar'
import ProgramList from './components/ProgramList'
import ImportModal from './components/ImportModal'
import CommunityTab from './components/CommunityTab'
import ScoringTab from './components/ScoringTab'
import CompareModal from './components/CompareModal'
import InterviewTab from './components/InterviewTab'
import OnboardingTour from './components/OnboardingTour'
import AboutTab from './components/AboutTab'
const StateCountsTab = lazy(() => import('./components/StateCountsTab'))
import ActionsMenu from './components/ActionsMenu'
import HeaderStats from './components/HeaderStats'
import FilterChips from './components/FilterChips'
import RerankBanner from './components/RerankBanner'
import Toast from './components/Toast'
import DataDisclaimer from './components/DataDisclaimer'
import { computeListFreshness, PRIVACY_LOCAL } from './utils/dataSources'
import {
  isValidStep2,
  PROFILE_COLLAPSE_KEY,
  FILTERS_COLLAPSE_KEY,
  PANELS_AUTO_COLLAPSED_KEY,
  AUTO_RANKED_KEY,
} from './utils/profile'
import { useAuth } from './context/AuthContext'

const STORAGE_KEY = 'imresidency_v1'

const DEFAULT_PROFILE = {
  step2: '',
  visaNeed: 'j1',
  step3: '',
  ecfmg: 'certified',
  yog: '',                   // year of graduation (e.g. '2022')
  medSchool: 'dow',          // 'dow' | 'other_pak'
  rotations: [],
  research: 'none',
}

// Personal signals/connections from initialState.json — used only as the
// FIRST-RUN seed (if localStorage has nothing yet).  Resets always go to
// empty so no personal data leaks when the site is published.
const SEED_SIGNALS     = defaultInitialState?.signals     ?? {}
const SEED_CONNECTIONS = defaultInitialState?.connections ?? {}
const DEFAULT_SIGNALS     = {}
const DEFAULT_CONNECTIONS = {}

const DEFAULT_FILTERS = {
  search: '',
  tier: 'all',
  state: 'all',
  region: 'all',
  status: 'all',
  connectionsOnly: false,
  shortlistOnly: false,
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App({ onLeaveApp }) {
  const { user: session } = useAuth()
  // Initialise from localStorage on first render, falling back to defaults
  const [profile, setProfile] = useState(() => {
    const saved = loadSaved()
    return saved?.profile ? { ...DEFAULT_PROFILE, ...saved.profile } : DEFAULT_PROFILE
  })
  const [signals, setSignals] = useState(() => {
    const saved = loadSaved()
    return saved?.signals ?? SEED_SIGNALS
  })
  const [connections, setConnections] = useState(() => {
    const saved = loadSaved()
    return saved?.connections ?? SEED_CONNECTIONS
  })
  const [notes, setNotes] = useState(() => {
    const saved = loadSaved()
    return saved?.notes ?? {}
  })
  const [statuses, setStatuses] = useState(() => {
    const saved = loadSaved()
    return saved?.statuses ?? {}
  })
  const [ivDates, setIvDates] = useState(() => {
    const saved = loadSaved()
    return saved?.ivDates ?? {}
  })
  const [shortlist, setShortlist] = useState(() => {
    const saved = loadSaved()
    return saved?.shortlist ?? {}
  })

  // Dark mode — persisted to localStorage independently
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('imresidency_dark') === '1' } catch { return false }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { localStorage.setItem('imresidency_dark', darkMode ? '1' : '0') } catch {}
  }, [darkMode])

  // Onboarding tour — manual only (? button); first visit starts on Profile tab
  const [showTour, setShowTour] = useState(false)

  function dismissTour() {
    try { localStorage.setItem('imresidency_onboarded', '1') } catch {}
    setShowTour(false)
  }

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [programs, setPrograms] = useState(defaultPrograms)
  const [showImport, setShowImport] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = loadSaved()
    const step2 = saved?.profile?.step2 ?? DEFAULT_PROFILE.step2
    return isValidStep2(step2) ? 'programs' : 'profile'
  })
  const [compareList, setCompareList] = useState([])   // up to 3 program_codes
  const [showCompare, setShowCompare] = useState(false)

  const COMPARE_MAX = 3

  function toggleCompare(programCode) {
    setCompareList((prev) => {
      if (prev.includes(programCode)) return prev.filter((c) => c !== programCode)
      if (prev.length >= COMPARE_MAX) return prev
      return [...prev, programCode]
    })
  }
  const [isRanking, setIsRanking] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [toast, setToast] = useState(null)
  const restoreInputRef = useRef(null)
  const profileSectionRef = useRef(null)

  const [filtersCollapsed, setFiltersCollapsed] = useState(() => {
    try { return localStorage.getItem(FILTERS_COLLAPSE_KEY) === 'true' } catch { return false }
  })

  const needsProfileSetup = !isValidStep2(profile.step2)

  function handleTabChange(tabId) {
    if (needsProfileSetup && tabId !== 'profile') return
    setActiveTab(tabId)
  }

  useEffect(() => {
    if (needsProfileSetup && activeTab !== 'profile') setActiveTab('profile')
  }, [needsProfileSetup, activeTab])

  function showToast(message, variant = 'info') {
    setToast({ message, variant })
  }

  function dismissToast() {
    setToast(null)
  }

  function persistFiltersCollapsed(value) {
    setFiltersCollapsed(value)
    try { localStorage.setItem(FILTERS_COLLAPSE_KEY, String(value)) } catch {}
  }

  function collapsePanelsAfterFirstRank() {
    try {
      if (localStorage.getItem(PANELS_AUTO_COLLAPSED_KEY) === '1') return
      localStorage.setItem(PANELS_AUTO_COLLAPSED_KEY, '1')
    } catch {}
    persistFiltersCollapsed(true)
  }

  function openProfilePanel() {
    setActiveTab('profile')
  }

  // Persist all user state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, signals, connections, notes, statuses, ivDates, shortlist }))
      setSavedFlash(true)
      const t = setTimeout(() => setSavedFlash(false), 1500)
      return () => clearTimeout(t)
    } catch {}
  }, [profile, signals, connections, notes, statuses, ivDates, shortlist])

  // Snapshot of the last "applied" state — the list only re-sorts/re-tiers
  // when the user explicitly clicks Apply or Re-rank.
  const [rankedState, setRankedState] = useState(() => {
    const saved = loadSaved()
    return {
      profile:     saved?.profile     ? { ...DEFAULT_PROFILE, ...saved.profile } : DEFAULT_PROFILE,
      signals:     saved?.signals     ?? SEED_SIGNALS,
      connections: saved?.connections ?? SEED_CONNECTIONS,
    }
  })

  function triggerRerank(options = {}) {
    const { message, collapsePanels = true, switchToPrograms = false } = options
    setIsRanking(true)
    setTimeout(() => {
      setRankedState({ profile, signals, connections })
      setIsRanking(false)
      showToast(message ?? 'Tier list updated', 'success')
      if (collapsePanels && isValidStep2(profile.step2)) {
        collapsePanelsAfterFirstRank()
      }
      if (switchToPrograms) setActiveTab('programs')
    }, 0)
  }

  // Mark auto-rank complete for returning users who already ranked
  useEffect(() => {
    if (isValidStep2(profile.step2) && rankedState.profile.step2 === profile.step2) {
      try { localStorage.setItem(AUTO_RANKED_KEY, '1') } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rank once when user enters a valid Step 2 for the first time
  useEffect(() => {
    if (!isValidStep2(profile.step2)) return
    if (rankedState.profile.step2 === profile.step2) return
    try {
      if (localStorage.getItem(AUTO_RANKED_KEY) === '1') return
      localStorage.setItem(AUTO_RANKED_KEY, '1')
    } catch {
      return
    }
    triggerRerank({
      message: `Ranked ${programs.length} programs — finish your profile, then open the Programs tab when ready`,
      collapsePanels: false,
    })
  }, [profile.step2]) // eslint-disable-line react-hooks/exhaustive-deps

  // Count total signals used (Gold + Silver both count toward 15)
  const signalsUsed = useMemo(
    () => Object.values(signals).filter(Boolean).length,
    [signals],
  )

  const goldUsed = useMemo(
    () => Object.values(signals).filter((v) => v === 'gold').length,
    [signals],
  )

  const silverUsed = useMemo(
    () => Object.values(signals).filter((v) => v === 'silver').length,
    [signals],
  )

  function handleIvDateChange(programCode, value) {
    setIvDates((prev) => {
      const isEmpty = !value || (!value.dateReceived && !value.interviewDate && !value.notes && (!value.format || value.format === 'unknown'))
      if (isEmpty) {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      return { ...prev, [programCode]: value }
    })
  }

  function handleNoteChange(programCode, text) {
    setNotes((prev) => {
      if (!text.trim()) {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      return { ...prev, [programCode]: text }
    })
  }

  function handleStatusChange(programCode, value) {
    setStatuses((prev) => {
      if (!value || value === 'not_applied') {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      return { ...prev, [programCode]: value }
    })
  }

  function handleToggleShortlist(programCode) {
    setShortlist((prev) => {
      if (prev[programCode]) {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      return { ...prev, [programCode]: true }
    })
  }

  const statusCounts = useMemo(() => {
    const counts = {}
    for (const v of Object.values(statuses)) {
      counts[v] = (counts[v] || 0) + 1
    }
    return counts
  }, [statuses])

  const shortlistCount = useMemo(
    () => Object.keys(shortlist).length,
    [shortlist],
  )

  const myListCount = useMemo(() => {
    return programs.filter((p) => {
      const code = p.program_code
      return (
        signals[code] ||
        connections[code]?.strength ||
        notes[code]?.trim() ||
        (statuses[code] && statuses[code] !== 'not_applied')
      )
    }).length
  }, [programs, signals, connections, notes, statuses])

  function handleConnection(programCode, value) {
    setConnections((prev) => {
      if (!value || !value.strength) {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      return { ...prev, [programCode]: value }
    })
  }

  function handleSignal(programCode, value) {
    setSignals((prev) => {
      const current = prev[programCode] || null
      // Removing a signal — always allow
      if (!value) {
        const next = { ...prev }
        delete next[programCode]
        return next
      }
      // Switching type on the same program — no new slot consumed, but still
      // enforce the per-type cap (e.g. already at 3 gold → can't switch another to gold)
      const goldUsed   = Object.values(prev).filter((v) => v === 'gold').length
      const silverUsed = Object.values(prev).filter((v) => v === 'silver').length

      if (value === 'gold') {
        // If this program already holds gold, it's a no-op toggle (handled elsewhere)
        // If it held silver, switching frees a silver slot and uses a gold slot
        const goldAfter = current === 'gold' ? goldUsed : goldUsed + (current === 'silver' ? 0 : 0) + 1
        // Simpler: count gold excluding this program, then +1
        const otherGold = Object.entries(prev).filter(([k, v]) => k !== programCode && v === 'gold').length
        if (otherGold >= SIGNAL_MAX_GOLD) return prev  // gold cap hit
      }

      if (value === 'silver') {
        const otherSilver = Object.entries(prev).filter(([k, v]) => k !== programCode && v === 'silver').length
        if (otherSilver >= SIGNAL_MAX_SILVER) return prev  // silver cap hit
      }

      // Adding a brand new signal (no current signal on this program): also check total
      if (!current) {
        const total = Object.values(prev).filter(Boolean).length
        if (total >= SIGNAL_MAX) return prev
      }

      return { ...prev, [programCode]: value }
    })
  }

  // Scores always stay live (so card details reflect current connections/signals)
  const scoredPrograms = useMemo(
    () => scorePrograms(programs, profile, signals, connections),
    [programs, profile, signals, connections],
  )

  // Stable baseline — scored and sorted from the last applied snapshot.
  // Only updates when the user clicks Apply or Re-rank.
  const stableScored = useMemo(() => {
    const scored = scorePrograms(programs, rankedState.profile, rankedState.signals, rankedState.connections)

    // If no meaningful profile has been set, sort alphabetically so the first
    // view is neutral and predictable rather than a score-based ranking.
    const profileIsBlank =
      !rankedState.profile.step2 &&
      Object.keys(rankedState.signals).length === 0 &&
      Object.keys(rankedState.connections).length === 0

    if (profileIsBlank) {
      return scored.sort((a, b) => a.program_name.localeCompare(b.program_name))
    }

    return scored.sort((a, b) => {
      const tierDiff = TIER_ORDER.indexOf(a.computed_tier) - TIER_ORDER.indexOf(b.computed_tier)
      if (tierDiff !== 0) return tierDiff
      return b.computed_score - a.computed_score
    })
  }, [programs, rankedState])

  // Merge live scores/tiers (for badge display) into stable-order array.
  // Position in the list and tier group come from stableScored;
  // the displayed score/tier on each card comes from scoredPrograms (live).
  const stablySortedPrograms = useMemo(() => {
    const liveByCode = Object.fromEntries(scoredPrograms.map((p) => [p.program_code, p]))
    return stableScored.map((stableProg) => {
      const live = liveByCode[stableProg.program_code]
      if (!live) return stableProg
      return {
        ...live,
        // Override tier/score used for GROUPING with the stable values
        computed_stable_tier:  stableProg.computed_tier,
        computed_stable_score: stableProg.computed_score,
      }
    })
  }, [stableScored, scoredPrograms])

  const states = useMemo(
    () => [...new Set(programs.map((p) => p.state))].filter(Boolean).sort(),
    [programs],
  )

  const regions = useMemo(
    () => [...new Set(programs.map((p) => p.region))].filter(Boolean).sort(),
    [programs],
  )

  const dataFreshness = useMemo(() => computeListFreshness(programs), [programs])

  function handleSelectState(stateCode) {
    setFilters((prev) => ({ ...prev, state: stateCode, region: 'all' }))
    setActiveTab('programs')
  }

  function handleSelectRegion(regionName) {
    setFilters((prev) => ({ ...prev, region: regionName, state: 'all' }))
    setActiveTab('programs')
  }

  // Count programs where live score OR tier has drifted from the last applied snapshot.
  // This covers both tier jumps AND score shifts within the same tier.
  const rerankCount = useMemo(() => {
    return stablySortedPrograms.filter(
      (p) =>
        p.computed_score !== p.computed_stable_score ||
        p.computed_tier  !== p.computed_stable_tier,
    ).length
  }, [stablySortedPrograms])

  const tierCounts = useMemo(() => {
    const counts = {}
    for (const tier of TIER_ORDER) {
      counts[tier] = stablySortedPrograms.filter((p) => p.computed_tier === tier).length
    }
    return counts
  }, [stablySortedPrograms])

  const profileIsActive = useMemo(
    () =>
      Boolean(
        rankedState.profile.step2 ||
        Object.keys(rankedState.signals).length > 0 ||
        Object.keys(rankedState.connections).length > 0,
      ),
    [rankedState],
  )

  function handleImport(importedPrograms, importedSignals) {
    const newSignals = importedSignals || {}
    setPrograms(importedPrograms)
    setSignals(newSignals)
    setConnections({})
    setNotes({})
    setShortlist({})
    setFilters(DEFAULT_FILTERS)
    setShowImport(false)
    setRankedState({ profile, signals: newSignals, connections: {} })
  }

  function resetToDefault() {
    setPrograms(defaultPrograms)
    setSignals({})
    setConnections({})
    setNotes({})
    setShortlist({})
    setFilters(DEFAULT_FILTERS)
    setRankedState({ profile, signals: {}, connections: {} })
  }

  function clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(AUTO_RANKED_KEY)
      localStorage.removeItem(PANELS_AUTO_COLLAPSED_KEY)
      localStorage.removeItem(PROFILE_COLLAPSE_KEY)
      localStorage.removeItem(FILTERS_COLLAPSE_KEY)
    } catch {}
    setProfile(DEFAULT_PROFILE)
    setSignals(DEFAULT_SIGNALS)
    setConnections(DEFAULT_CONNECTIONS)
    setNotes({})
    setStatuses({})
    setIvDates({})
    setShortlist({})
    setFilters(DEFAULT_FILTERS)
    setRankedState({ profile: DEFAULT_PROFILE, signals: DEFAULT_SIGNALS, connections: DEFAULT_CONNECTIONS })
    persistFiltersCollapsed(false)
    setActiveTab('profile')
    setShowClearModal(false)
  }

  function clearProgramData() {
    setSignals(DEFAULT_SIGNALS)
    setConnections(DEFAULT_CONNECTIONS)
    setNotes({})
    setStatuses({})
    setIvDates({})
    setShortlist({})
    setCompareList([])
    setShowClearModal(false)
  }

  const isImported = programs !== defaultPrograms

  function exportToCSV() {
    const STATUS_LABELS = {
      not_applied: '',
      applied:     'Applied',
      ii_received: 'II Received',
      declined:    'Declined',
      waitlisted:  'Waitlisted',
      matched:     'Matched',
    }
    const headers = [
      'Rank', 'Tier', 'Score', 'Program', 'State', 'Program Type',
      'Visa', 'Median Step 2', 'Signal', 'Connection', 'Status', 'Notes',
    ]
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = stablySortedPrograms.map((p, i) => [
      i + 1,
      p.computed_tier,
      p.computed_score,
      escape(p.program_name),
      p.state ?? '',
      p.program_type ?? '',
      p.visa_type ?? '',
      p.median_step2 ?? '',
      signals[p.program_code] ?? '',
      connections[p.program_code]?.strength ?? '',
      STATUS_LABELS[statuses[p.program_code]] ?? '',
      escape(notes[p.program_code] ?? ''),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `residencycompass-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Full program list exported', 'success')
  }

  function exportBackup() {
    const payload = {
      version: 1,
      app: 'ResidencyCompass',
      exportedAt: new Date().toISOString(),
      profile,
      signals,
      connections,
      notes,
      statuses,
      ivDates,
      shortlist,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `residencycompass-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded — store this file somewhere safe', 'success')
  }

  function promptRestore() {
    restoreInputRef.current?.click()
  }

  function applyBackup(data) {
    const nextProfile = data.profile
      ? { ...DEFAULT_PROFILE, ...data.profile }
      : DEFAULT_PROFILE
    const nextSignals = data.signals ?? {}
    const nextConnections = data.connections ?? {}
    setProfile(nextProfile)
    setSignals(nextSignals)
    setConnections(nextConnections)
    setNotes(data.notes ?? {})
    setStatuses(data.statuses ?? {})
    setIvDates(data.ivDates ?? {})
    setShortlist(data.shortlist ?? {})
    setCompareList([])
    setRankedState({
      profile: nextProfile,
      signals: nextSignals,
      connections: nextConnections,
    })
  }

  function handleRestoreFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid file')
        }
        const hasUserData =
          data.profile?.step2 ||
          Object.keys(data.signals ?? {}).length > 0 ||
          Object.keys(data.connections ?? {}).length > 0 ||
          Object.keys(data.notes ?? {}).length > 0 ||
          Object.keys(data.statuses ?? {}).length > 0 ||
          Object.keys(data.shortlist ?? {}).length > 0

        if (!hasUserData && !data.profile) {
          throw new Error('No ResidencyCompass data found in this file')
        }

        const replacing =
          profile.step2 ||
          Object.keys(signals).length > 0 ||
          Object.keys(connections).length > 0 ||
          Object.keys(notes).length > 0 ||
          Object.keys(statuses).length > 0 ||
          Object.keys(shortlist).length > 0

        if (replacing && !window.confirm('Restore will replace your current profile, signals, and notes in this browser. Continue?')) {
          return
        }

        applyBackup(data)
        showToast('Backup restored successfully', 'success')
      } catch {
        showToast('Could not read backup file. Use a .json file exported from ResidencyCompass.', 'error')
      }
    }
    reader.readAsText(file)
  }

  function exportShortlist() {
    const STATUS_LABELS = {
      not_applied: '', applied: 'Applied', ii_received: 'II Received',
      declined: 'Declined', waitlisted: 'Waitlisted', matched: 'Matched',
    }
    const SIGNAL_LABELS = { gold: '★ Gold', silver: '☆ Silver' }
    const CONN_LABELS = { strong: 'Strong', moderate: 'Moderate', weak: 'Weak' }

    const shortlisted = stablySortedPrograms.filter((p) => shortlist[p.program_code])

    if (shortlisted.length === 0) {
      showToast('Your shortlist is empty. Use Shortlist on any program card to add one.', 'warning')
      return
    }

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['Rank', 'Tier', 'Score', 'Program', 'State', 'Type', 'Median Step 2', 'Signal', 'Connection', 'Status', 'Notes']
    const rows = shortlisted.map((p, i) => [
      i + 1,
      p.computed_tier,
      p.computed_score,
      escape(p.program_name),
      p.state ?? '',
      p.program_type ?? '',
      p.median_step2 ?? '',
      SIGNAL_LABELS[signals[p.program_code]] ?? '',
      CONN_LABELS[connections[p.program_code]?.strength] ?? '',
      STATUS_LABELS[statuses[p.program_code]] ?? '',
      escape(notes[p.program_code] ?? ''),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shortlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Shortlist exported (${shortlisted.length} programs)`, 'success')
  }

  function exportMyList() {
    const STATUS_LABELS = {
      not_applied: '', applied: 'Applied', ii_received: 'II Received',
      declined: 'Declined', waitlisted: 'Waitlisted', matched: 'Matched',
    }
    const SIGNAL_LABELS = { gold: '★ Gold', silver: '☆ Silver' }
    const CONN_LABELS = { strong: 'Strong', moderate: 'Moderate', weak: 'Weak' }

    // Only programs the user has touched in any way
    const myPrograms = stablySortedPrograms.filter((p) => {
      const code = p.program_code
      return (
        signals[code] ||
        connections[code]?.strength ||
        notes[code]?.trim() ||
        (statuses[code] && statuses[code] !== 'not_applied')
      )
    })

    if (myPrograms.length === 0) {
      showToast('My List is empty. Add a signal, connection, note, or status to a program first.', 'warning')
      return
    }

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['Rank', 'Tier', 'Score', 'Program', 'State', 'Type', 'Median Step 2', 'Signal', 'Connection', 'Status', 'Notes']
    const rows = myPrograms.map((p, i) => [
      i + 1,
      p.computed_tier,
      p.computed_score,
      escape(p.program_name),
      p.state ?? '',
      p.program_type ?? '',
      p.median_step2 ?? '',
      SIGNAL_LABELS[signals[p.program_code]] ?? '',
      CONN_LABELS[connections[p.program_code]?.strength] ?? '',
      STATUS_LABELS[statuses[p.program_code]] ?? '',
      escape(notes[p.program_code] ?? ''),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-im-list-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`My List exported (${myPrograms.length} programs)`, 'success')
  }

  const STATUS_PRINT_LABELS = {
    applied:     'Applied',
    ii_received: 'II Received',
    declined:    'Declined',
    waitlisted:  'Waitlisted',
    matched:     '🎉 Matched',
  }

  const iiCount = useMemo(
    () => Object.values(statuses).filter((v) => v === 'ii_received').length,
    [statuses],
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-5 md:px-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/favicon.svg"
                  alt="ResidencyCompass logo"
                  className="h-11 w-11 shrink-0 rounded-xl object-contain shadow-sm md:h-12 md:w-12"
                />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
                  ResidencyCompass
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {session?.email && (
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400" title={session.email}>
                      {session.name || session.email}
                    </span>
                    {onLeaveApp && (
                      <button
                        type="button"
                        onClick={() => onLeaveApp()}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowTour(true)}
                  title="Show onboarding tour"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  ?
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              IM program ranker for Pakistani IMGs · data saved in your browser
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity duration-500 ${
                  savedFlash ? 'opacity-100 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'opacity-0'
                }`}
              >
                ✓ saved
              </span>
            </p>
            {dataFreshness.verifiedLabel && (
              <p
                className="mt-1.5 flex flex-wrap items-center gap-2"
                title="When program entries were last checked by curators — not an official freshness guarantee"
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    dataFreshness.isVeryStale
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                      : dataFreshness.isStale
                      ? 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                  }`}
                >
                  Curated list · last checked {dataFreshness.verifiedLabel}
                  {dataFreshness.staleCount > 0 && (
                    <> · {dataFreshness.staleCount} entries may be outdated</>
                  )}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Verify on program websites before applying
                </span>
              </p>
            )}

            <HeaderStats
              goldUsed={goldUsed}
              silverUsed={silverUsed}
              signalsUsed={signalsUsed}
              shortlistCount={shortlistCount}
              connectionCount={Object.keys(connections).length}
              statusCounts={statusCounts}
            />
          </div>

          {/* Tab navigation */}
          <div className="mt-4 -mx-4 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 dark:border-slate-700 md:mx-0 md:px-0">
            {[
              { id: 'profile',    label: 'Profile' },
              { id: 'programs',   label: 'Programs' },
              { id: 'geography',  label: 'By State' },
              { id: 'interviews', label: 'Interviews', badge: iiCount > 0 ? iiCount : null },
              { id: 'scoring',    label: 'How Scoring Works' },
              { id: 'about',      label: 'About' },
              { id: 'community',  label: 'Community Data' },
            ].map((tab) => {
              const locked = needsProfileSetup && tab.id !== 'profile'
              return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                disabled={locked}
                title={locked ? 'Enter your Step 2 score on the Profile tab first' : undefined}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                    : locked
                    ? 'cursor-not-allowed border-transparent text-slate-300 dark:text-slate-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {tab.badge != null && (
                  <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            )})}
          </div>

          {/* Program actions (programs tab only) */}
          {activeTab === 'programs' && (
            <div className="mt-3 flex justify-end">
              <ActionsMenu
                programCount={programs.length}
                isImported={isImported}
                shortlistCount={shortlistCount}
                myListCount={myListCount}
                onImport={() => setShowImport(true)}
                onReset={resetToDefault}
                onExportCSV={exportToCSV}
                onExportShortlist={exportShortlist}
                onExportMyList={exportMyList}
                onBackup={exportBackup}
                onRestore={promptRestore}
                onPrint={() => window.print()}
                onClearData={() => setShowClearModal(true)}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 md:px-6 md:py-8">

        {/* Geography tab */}
        {activeTab === 'geography' && (
          <Suspense fallback={
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Loading map…
            </div>
          }>
            <StateCountsTab
              programs={stablySortedPrograms}
              shortlist={shortlist}
              onSelectState={handleSelectState}
              onSelectRegion={handleSelectRegion}
              selectedState={filters.state !== 'all' ? filters.state : null}
              selectedRegion={filters.region !== 'all' ? filters.region : null}
              isDark={darkMode}
              profileActive={profileIsActive}
            />
          </Suspense>
        )}

        {/* Interviews tab */}
        {activeTab === 'interviews' && (
          <InterviewTab
            programs={stablySortedPrograms}
            statuses={statuses}
            ivDates={ivDates}
            onIvDateChange={handleIvDateChange}
          />
        )}

        {/* Community tab */}
        {activeTab === 'community' && <CommunityTab programs={programs} />}

        {/* Scoring tab */}
        {activeTab === 'scoring' && <ScoringTab />}

        {/* About tab */}
        {activeTab === 'about' && <AboutTab />}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <>
            <ProfileForm
              profile={profile}
              onChange={setProfile}
              onApply={() => triggerRerank({ switchToPrograms: true })}
              programs={programs}
              isRanking={isRanking}
              layout="tab"
              isOnboarding={needsProfileSetup}
              sectionRef={profileSectionRef}
            />
            <RerankBanner count={rerankCount} isRanking={isRanking} onRerank={() => triggerRerank({ switchToPrograms: true })} />
          </>
        )}

        {/* Programs tab */}
        {activeTab === 'programs' && <>
        <DataDisclaimer variant="banner" />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          states={states}
          regions={regions}
          tierCounts={tierCounts}
          statusCounts={statusCounts}
          shortlistCount={shortlistCount}
          collapsed={filtersCollapsed}
          onCollapsedChange={persistFiltersCollapsed}
        />

        <FilterChips
          filters={filters}
          onChange={setFilters}
          shortlistCount={shortlistCount}
        />

        <RerankBanner count={rerankCount} isRanking={isRanking} onRerank={() => triggerRerank()} />

        <ProgramList
          programs={stablySortedPrograms}
          filters={filters}
          signals={signals}
          onSignal={handleSignal}
          goldUsed={goldUsed}
          silverUsed={silverUsed}
          connections={connections}
          onConnection={handleConnection}
          notes={notes}
          onNoteChange={handleNoteChange}
          rotations={profile.rotations || []}
          statuses={statuses}
          onStatusChange={handleStatusChange}
          compareList={compareList}
          onToggleCompare={toggleCompare}
          compareMax={COMPARE_MAX}
          shortlist={shortlist}
          onToggleShortlist={handleToggleShortlist}
          userStep2={profile.step2}
          profileActive={profileIsActive}
          onOpenProfile={openProfilePanel}
        />
        </>}

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl space-y-2 px-4 md:px-6">
          <DataDisclaimer variant="footer" className="text-center" />
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            {PRIVACY_LOCAL}
          </p>
        </div>
      </footer>

      {/* ── Import modal ── */}
      {showImport && (
        <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
      )}

      {/* ── Onboarding tour ── */}
      {showTour && <OnboardingTour onDone={dismissTour} />}

      <input
        ref={restoreInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleRestoreFile}
      />

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      )}

      {/* ── Clear data modal ── */}
      {showClearModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="px-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl">
                  🗑
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Clear saved data</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose what you want to remove. This cannot be undone.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* Option A — program data only */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">Clear program annotations only</p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Removes all signals, connections, notes, shortlist, and application statuses from every card.
                    Your profile (Step 2, visa, rotations, etc.) is kept.
                  </p>
                  <button
                    type="button"
                    onClick={clearProgramData}
                    className="mt-3 rounded-lg border border-amber-400 bg-white px-4 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    Clear signals, connections, notes &amp; statuses
                  </button>
                </div>

                {/* Option B — everything */}
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-900">Reset everything to factory defaults</p>
                  <p className="mt-0.5 text-xs text-red-700">
                    Clears all of the above <strong>plus</strong> your profile, Step 2 score, rotations, and all preferences.
                    The app will look brand new.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllData}
                    className="mt-3 rounded-lg border border-red-400 bg-white px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Reset everything
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compare modal ── */}
      {showCompare && (
        <CompareModal
          programs={stablySortedPrograms.filter((p) => compareList.includes(p.program_code))}
          signals={signals}
          connections={connections}
          statuses={statuses}
          notes={notes}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* ── Sticky compare bar ── */}
      {compareList.length > 0 && !showCompare && (
        <div className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 md:px-6">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
              Comparing {compareList.length}/{COMPARE_MAX}:
            </span>
            <div className="flex flex-1 flex-wrap gap-2 min-w-0">
              {compareList.map((code) => {
                const p = stablySortedPrograms.find((x) => x.program_code === code)
                return (
                  <span key={code} className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 pl-3 pr-1 py-0.5 text-sm text-blue-800">
                    <span className="max-w-[160px] truncate">{p?.program_name ?? code}</span>
                    <button type="button" onClick={() => toggleCompare(code)} className="rounded-full p-0.5 hover:bg-blue-200" title="Remove">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
                    </button>
                  </span>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowCompare(true)}
              disabled={compareList.length < 2}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Compare ↗
            </button>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="shrink-0 text-sm text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Print-only ranked table ── */}
      <div className="print-only" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>ResidencyCompass — Program List</h1>
        <p style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
          Step 2: {profile.step2 || '—'} · Visa: {profile.visaNeed} · Generated {new Date().toLocaleDateString()}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['#', 'Tier', 'Score', 'Program', 'State', 'Type', 'Median Step 2', 'Signal', 'Status', 'Notes'].map((h) => (
                <th key={h} style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stablySortedPrograms.map((p, i) => (
              <tr key={p.program_code} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{i + 1}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px', fontWeight: '600' }}>{p.computed_tier}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{p.computed_score}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{p.program_name}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{p.state}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{p.program_type}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{p.median_step2 ?? '—'}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{signals[p.program_code] ?? ''}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px' }}>{STATUS_PRINT_LABELS[statuses[p.program_code]] ?? ''}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px', maxWidth: '160px' }}>{notes[p.program_code] ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body > #root > div > header,
          body > #root > div > main,
          body > #root > div > footer { display: none !important; }
        }
      `}</style>
    </div>
  )
}
