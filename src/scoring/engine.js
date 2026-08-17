// ─── Scoring budget ───────────────────────────────────────────────────────────
import { isDowMedicalSchool } from '../constants/pakMedicalSchools'
import { normalizeErasRegions } from '../constants/erasRegions'

// Calibrated so scores feel "full" (55–85 for most programs) while the
// absolute theoretical maximum stays around 95–97 — the 0–100 clamp exists
// as a safety net but should rarely fire in practice.
//
// Scenario benchmarks (Dow grad, 245 Step 2, J1, ECFMG, community, Dow+Pak match):
//   No connections         → ~61  (LIKELY)
//   + Moderate connection  → ~77  (TARGET)
//   + Strong connection    → ~89  (TARGET)
//   Absolute stacked max   → ~97  (never reaches 100)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Connection weights ───────────────────────────────────────────────────────
export const WEIGHT_CONNECTION_STRONG   = 28   // Direct mentor, PD, faculty member
export const WEIGHT_CONNECTION_MODERATE = 16   // Named contact who may recommend
export const WEIGHT_CONNECTION_WEAK     = 7    // Peripheral / second-degree
export const WEIGHT_CONNECTION_NONE     = 0
export const CONNECTION_OVERRIDE_THRESHOLD = 26  // ≥ 26 → force TARGET tier
// Note: moderate×1 = 16 (no override), moderate×2 = 32 (override), strong×1 = 28 (override)

// Count bonuses — added on top of strength base
export const CONNECTION_COUNT_BONUS_TWO   = 4    // 2 contacts at same program
export const CONNECTION_COUNT_BONUS_THREE = 6    // 3+ contacts at same program

// ─── Pakistani graduate match history ────────────────────────────────────────
export const WEIGHT_DOW_GRAD_DOW_MATCH      = 16   // Dow grad, dow_matched YES
export const WEIGHT_DOW_GRAD_PAK_ONLY       = 10   // Dow grad, pak_matched YES but dow_matched NO
export const WEIGHT_DOW_GRAD_BOTH           = 22   // Dow grad, both matched

export const WEIGHT_OTHER_PAK_PAK_MATCH     = 10   // Other Pak, pak_matched YES
export const WEIGHT_OTHER_PAK_DOW_ONLY      = 4    // Other Pak, dow_matched YES only (different school)

export const WEIGHT_DOW_PAK_NOT_SURE        = 2    // uncertain — kept small
export const WEIGHT_DOW_PAK_NONE            = 0

// ─── Step 2 CK fit ────────────────────────────────────────────────────────────
export const WEIGHT_STEP2_ABOVE_CUTOFF = 23   // well above published median/cutoff
export const WEIGHT_STEP2_STRONG       = 27   // ≥ crowdsourced avg + 8
export const WEIGHT_STEP2_ON_PAR       = 14   // within avg ± 8
export const WEIGHT_STEP2_BELOW        = 2    // below avg − 5 (hurts but doesn't zero)
export const WEIGHT_STEP2_NO_DATA      = 10   // no program score data available

// ─── Step 3 ───────────────────────────────────────────────────────────────────
export const WEIGHT_STEP3_PASSED = 4
export const WEIGHT_STEP3_NONE   = 0

// ─── ECFMG certification ──────────────────────────────────────────────────────
// ECFMG certification is a hard requirement for ERAS submission as an IMG.
// Not being certified by the deadline is a serious red flag for programs.
export const WEIGHT_ECFMG_CERTIFIED = 4    // baseline compliance bonus
export const WEIGHT_ECFMG_PENDING   = -3   // in progress but incomplete — small penalty
export const WEIGHT_ECFMG_NOT       = -10  // not started — major deduction across all programs

// ─── Visa status ──────────────────────────────────────────────────────────────
export const WEIGHT_NO_VISA_BOOST = 12

// ─── US clinical rotations ────────────────────────────────────────────────────
export const WEIGHT_ROTATIONS_6_PLUS  = 7    // 6+ months
export const WEIGHT_ROTATIONS_3_TO_5  = 5    // 3–5 months
export const WEIGHT_ROTATIONS_1_TO_2  = 3    // 1–2 months
export const WEIGHT_ROTATIONS_NONE    = 0
export const WEIGHT_ROTATIONS_STATE_MATCH   = 2   // state match (kept minimal)
export const WEIGHT_ROTATIONS_PROGRAM_MATCH = 10  // rotation at this specific program

// ─── ERAS geographic preference ───────────────────────────────────────────────
export const WEIGHT_ERAS_REGION_MATCH = 16   // moderate boost — same weight as a moderate connection

// ─── Research ─────────────────────────────────────────────────────────────────
export const WEIGHT_RESEARCH_MULTI_HIGH    = 13
export const WEIGHT_RESEARCH_SINGLE_HIGH   = 9
export const WEIGHT_RESEARCH_MULTI_ANY     = 6
export const WEIGHT_RESEARCH_SINGLE_ANY    = 4
export const WEIGHT_RESEARCH_PRESENTATIONS = 2
export const WEIGHT_RESEARCH_NONE          = 0

export const RESEARCH_MULTIPLIER_UNIVERSITY  = 1.0
export const RESEARCH_MULTIPLIER_AFFILIATED  = 0.6
export const RESEARCH_MULTIPLIER_COMMUNITY   = 0.3

// ─── Program type ─────────────────────────────────────────────────────────────
export const WEIGHT_TYPE_COMMUNITY  = 8
export const WEIGHT_TYPE_AFFILIATED = 6
export const WEIGHT_TYPE_UNIVERSITY = 2

// ─── Per-program signal ───────────────────────────────────────────────────────
export const WEIGHT_SIGNAL_GOLD_REQUIRED   = 8
export const WEIGHT_SIGNAL_SILVER_REQUIRED = 5
export const WEIGHT_SIGNAL_GOLD_HELPS      = 6
export const WEIGHT_SIGNAL_SILVER_HELPS    = 4
export const WEIGHT_SIGNAL_NONE_REQUIRED   = 0
export const WEIGHT_SIGNAL_NONE_HELPS      = 3
export const WEIGHT_SIGNAL_NEUTRAL         = 5

// ─── Penalties ────────────────────────────────────────────────────────────────
// Per-program flags (when program notes mention YOG restrictions etc.)
export const PENALTY_YOG_PROGRAM      = 10  // program explicitly restricts by YOG
export const PENALTY_VERY_COMPETITIVE = 5
export const PENALTY_NO_IMG           = 14
export const PENALTY_SOAPED           = 4
export const PENALTY_MAX              = 14  // cap applied to per-program flags

// Profile-level YOG gap penalty — applied flat to every program's raw score.
// Years since graduation → penalty points
export const PENALTY_YOG_4_5   = 8    // 4–5 years
export const PENALTY_YOG_6_8   = 15   // 6–8 years
export const PENALTY_YOG_9PLUS = 20   // 9+ years

// ─── Tier thresholds ─────────────────────────────────────────────────────────
export const TIER_TARGET    = 'TARGET'
export const TIER_LIKELY    = 'LIKELY'
export const TIER_REACH     = 'REACH'
export const TIER_LONG_SHOT = 'LONG SHOT'
// Calibrated for the mid-range weights above:
//   Good fit, no connections  ≈ 61   → LIKELY
//   Good fit + moderate conn  ≈ 77   → TARGET
//   Weak fit, no connection   ≈ 14   → LONG SHOT
export const TIER_THRESHOLD_TARGET    = 65
export const TIER_THRESHOLD_LIKELY    = 38
export const TIER_THRESHOLD_REACH     = 20

export const TIER_ORDER = [TIER_TARGET, TIER_LIKELY, TIER_REACH, TIER_LONG_SHOT]
export const SIGNAL_MAX_GOLD   = 3
export const SIGNAL_MAX_SILVER = 12
export const SIGNAL_MAX        = SIGNAL_MAX_GOLD + SIGNAL_MAX_SILVER  // 15 total

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(text) {
  return (text || '').toLowerCase().trim()
}

// ─── Connection scoring (explicit per-program) ────────────────────────────────

/**
 * @param {{ strength: 'strong'|'moderate'|'weak'|null, count: 1|2|3, names: string }|null} conn
 */
function scoreConnection(conn) {
  if (!conn || !conn.strength) {
    return { score: WEIGHT_CONNECTION_NONE, note: 'No connection at this program', hasConnection: false }
  }

  const BASE = {
    strong:   WEIGHT_CONNECTION_STRONG,
    moderate: WEIGHT_CONNECTION_MODERATE,
    weak:     WEIGHT_CONNECTION_WEAK,
  }
  const COUNT_BONUS = {
    1: 0,
    2: CONNECTION_COUNT_BONUS_TWO,
    3: CONNECTION_COUNT_BONUS_THREE,
  }

  const count  = conn.count >= 3 ? 3 : (conn.count || 1)
  const base   = BASE[conn.strength] ?? 0
  const bonus  = COUNT_BONUS[count] || 0
  const score  = Math.min(WEIGHT_CONNECTION_STRONG, base + bonus)

  const countLabel = count >= 3 ? '3+' : count
  const namesNote  = conn.names ? ` — ${conn.names}` : ''
  const note       = `${conn.strength} connection, ${countLabel} contact${count !== 1 ? 's' : ''}${namesNote}`

  return { score, note, hasConnection: true }
}

// ─── Pakistani graduate pathways ──────────────────────────────────────────────

function scoreDowPak(program, medSchool) {
  const dowYes = normalize(program.dow_matched) === 'yes'
  const pakYes = normalize(program.pak_matched) === 'yes'
  const dowNo  = normalize(program.dow_matched) === 'no'
  const pakNo  = normalize(program.pak_matched) === 'no'

  const isDowGrad = isDowMedicalSchool(medSchool)

  if (isDowGrad) {
    if (dowYes && pakYes) return { score: WEIGHT_DOW_GRAD_BOTH,      note: 'Strong Pakistani graduate pathway at this program' }
    if (dowYes)           return { score: WEIGHT_DOW_GRAD_DOW_MATCH,  note: 'Pakistani graduates matched here' }
    if (pakYes)           return { score: WEIGHT_DOW_GRAD_PAK_ONLY,   note: 'Pakistani graduates matched here' }
    if (!dowNo && !pakNo) return { score: WEIGHT_DOW_PAK_NOT_SURE,    note: 'Pakistani graduate pathway status uncertain' }
    return { score: WEIGHT_DOW_PAK_NONE, note: 'No known Pakistani graduate matches at this program' }
  }

  // Other Pakistani medical school
  if (pakYes)           return { score: WEIGHT_OTHER_PAK_PAK_MATCH, note: 'Pakistani graduates matched here' }
  if (dowYes)           return { score: WEIGHT_OTHER_PAK_DOW_ONLY,  note: 'Pakistani graduates matched here' }
  if (!dowNo && !pakNo) return { score: WEIGHT_DOW_PAK_NOT_SURE,    note: 'Pakistani graduate pathway status uncertain' }
  return { score: WEIGHT_DOW_PAK_NONE, note: 'No known Pakistani graduate matches at this program' }
}

// ─── ERAS region preference ───────────────────────────────────────────────────

function scoreErasRegion(program, erasRegions) {
  const prefs = normalizeErasRegions(erasRegions)
  if (!prefs.length || !program.region) {
    return { score: 0, note: prefs.length ? 'Program region not listed' : null }
  }
  if (prefs.includes(program.region)) {
    return {
      score: WEIGHT_ERAS_REGION_MATCH,
      note: `Your ERAS region preference (${program.region}) — moderate boost`,
    }
  }
  return { score: 0, note: null }
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function extractStep2Scores(program) {
  const scores = []
  const median = parseInt(program.median_step2, 10)
  if (!isNaN(median) && median >= 200 && median <= 280) scores.push(median)
  const patterns = (program.crowdsourced_outcomes || '').match(/\b(2[0-9][0-9])\b/g) || []
  for (const s of patterns) {
    const n = parseInt(s, 10)
    if (n >= 200 && n <= 280) scores.push(n)
  }
  return scores
}

function scoreStep2(program, userStep2) {
  const userScore = parseInt(userStep2, 10)
  if (isNaN(userScore)) {
    return { score: WEIGHT_STEP2_NO_DATA, note: 'Enter your Step 2 score for a better fit estimate' }
  }
  const programScores = extractStep2Scores(program)
  const median = parseInt(program.median_step2, 10)
  const cutoff = !isNaN(median) ? median : null

  if (cutoff && userScore >= cutoff + 5) {
    return { score: WEIGHT_STEP2_ABOVE_CUTOFF, note: `Your ${userScore} is above program cutoff (~${cutoff})` }
  }
  if (programScores.length === 0) {
    return { score: WEIGHT_STEP2_NO_DATA, note: 'No Step 2 data available for this program' }
  }
  const avg = programScores.reduce((a, b) => a + b, 0) / programScores.length
  if (userScore >= avg + 8)  return { score: WEIGHT_STEP2_STRONG,  note: `Your ${userScore} is well above avg (~${Math.round(avg)})` }
  if (userScore >= avg - 5)  return { score: WEIGHT_STEP2_ON_PAR,  note: `Your ${userScore} is on par with avg (~${Math.round(avg)})` }
  return { score: WEIGHT_STEP2_BELOW, note: `Your ${userScore} is below program avg (~${Math.round(avg)})` }
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function scoreStep3(step3Value) {
  const val = normalize(step3Value)
  if (!val || val === 'not_taken') return { score: WEIGHT_STEP3_NONE, note: 'Step 3 not taken' }
  const numeric = parseInt(val, 10)
  if (!isNaN(numeric) && numeric >= 190) return { score: WEIGHT_STEP3_PASSED, note: `Step 3 passed (${numeric})` }
  return { score: WEIGHT_STEP3_PASSED, note: 'Step 3 taken and passed' }
}

// ─── ECFMG ────────────────────────────────────────────────────────────────────

function scoreEcfmg(ecfmgValue) {
  switch (normalize(ecfmgValue)) {
    case 'certified': return { score: WEIGHT_ECFMG_CERTIFIED, note: 'ECFMG certified (+4)' }
    case 'pending':   return { score: WEIGHT_ECFMG_PENDING,   note: 'Certification in progress — must complete before ERAS deadline (−3)' }
    default:          return { score: WEIGHT_ECFMG_NOT,        note: 'Not certified — required for ERAS submission as an IMG (−10)' }
  }
}

// ─── Rotations ────────────────────────────────────────────────────────────────

function scoreRotations(profile, programState) {
  // profile.rotations = [{ state: string, months: number }, ...]
  const rotations = Array.isArray(profile.rotations) ? profile.rotations : []
  const totalMonths = rotations.reduce((sum, r) => sum + (parseInt(r.months, 10) || 0), 0)

  let baseScore = WEIGHT_ROTATIONS_NONE
  let note = 'No US clinical rotations'

  if (totalMonths >= 6) {
    baseScore = WEIGHT_ROTATIONS_6_PLUS
    note = `${totalMonths} months of US rotations`
  } else if (totalMonths >= 3) {
    baseScore = WEIGHT_ROTATIONS_3_TO_5
    note = `${totalMonths} months of US rotations`
  } else if (totalMonths >= 1) {
    baseScore = WEIGHT_ROTATIONS_1_TO_2
    note = `${totalMonths} month${totalMonths > 1 ? 's' : ''} of US rotations`
  }

  // Program-specific match — rotated at this exact program
  const programMatch = rotations.some(
    (r) => r.programCode && r.programCode === programState?.__code,
  )

  // State match — rotated anywhere in the same state (only if no program match)
  const progState = (programState?.__state || programState || '').toLowerCase()
  const stateMatch = !programMatch && progState && rotations.some(
    (r) => r.state && r.state !== 'none' && r.state.toLowerCase() === progState,
  )

  const bonus = programMatch
    ? WEIGHT_ROTATIONS_PROGRAM_MATCH
    : stateMatch ? WEIGHT_ROTATIONS_STATE_MATCH : 0

  if (programMatch)  note += ' (rotated at this program)'
  else if (stateMatch) note += ` (rotated in ${progState})`

  return { score: baseScore + bonus, note }
}

// ─── Research ─────────────────────────────────────────────────────────────────

function researchMultiplier(programType) {
  const t = normalize(programType || '')
  if (t.includes('community'))   return RESEARCH_MULTIPLIER_COMMUNITY
  if (t.includes('affiliated'))  return RESEARCH_MULTIPLIER_AFFILIATED
  // 'univeristy' (typo in data) or 'university'
  return RESEARCH_MULTIPLIER_UNIVERSITY
}

function scoreResearch(researchValue, programType) {
  let base = WEIGHT_RESEARCH_NONE
  let note = 'No research / publications listed'

  switch (normalize(researchValue)) {
    case 'multi_high':    base = WEIGHT_RESEARCH_MULTI_HIGH;    note = '2+ publications in high-impact journals'; break
    case 'single_high':   base = WEIGHT_RESEARCH_SINGLE_HIGH;   note = '1 publication in a high-impact journal';  break
    case 'multi_any':     base = WEIGHT_RESEARCH_MULTI_ANY;     note = 'Multiple publications (any journal)';     break
    case 'single_any':    base = WEIGHT_RESEARCH_SINGLE_ANY;    note = '1 publication (any journal)';             break
    case 'presentations': base = WEIGHT_RESEARCH_PRESENTATIONS; note = 'Presentations or abstracts only';         break
  }

  if (base === 0) return { score: 0, note }

  const mult  = researchMultiplier(programType)
  const score = Math.round(base * mult)
  const typeLabel = mult === RESEARCH_MULTIPLIER_COMMUNITY  ? 'community program — research weighted ×0.3'
                  : mult === RESEARCH_MULTIPLIER_AFFILIATED ? 'affiliated program — research weighted ×0.6'
                  : 'university program — full research weight'
  return { score, note: `${note} (${typeLabel})` }
}

// ─── Program type ─────────────────────────────────────────────────────────────

function scoreProgramType(program) {
  const type = normalize(program.program_type)
  if (type.includes('community'))  return { score: WEIGHT_TYPE_COMMUNITY,  note: 'Community program — typically IMG-friendly' }
  if (type.includes('affiliated')) return { score: WEIGHT_TYPE_AFFILIATED, note: 'Affiliated hospital program' }
  if (type.includes('university')) return { score: WEIGHT_TYPE_UNIVERSITY, note: 'University program — often more competitive for IMGs' }
  return { score: WEIGHT_TYPE_AFFILIATED, note: 'Program type not specified' }
}

// ─── Signal ───────────────────────────────────────────────────────────────────

function classifySignalPolicy(signalPolicy) {
  const text = normalize(signalPolicy)
  if (/required|must signal|mandatory/.test(text)) return 'required'
  if (/helps|encouraged|recommended|prefer/.test(text)) return 'helps'
  return 'neutral'
}

function scoreSignal(program, programSignal) {
  const policy = classifySignalPolicy(program.signal_policy)
  const gold   = programSignal === 'gold'
  const silver = programSignal === 'silver'
  const hasSignal = gold || silver

  if (policy === 'required') {
    if (gold)   return { score: WEIGHT_SIGNAL_GOLD_REQUIRED,   note: 'Gold signal allocated — signal required here' }
    if (silver) return { score: WEIGHT_SIGNAL_SILVER_REQUIRED, note: 'Silver signal allocated — signal required here' }
    return { score: WEIGHT_SIGNAL_NONE_REQUIRED, note: 'Signal required but none allocated' }
  }
  if (policy === 'helps') {
    if (gold)   return { score: WEIGHT_SIGNAL_GOLD_HELPS,   note: 'Gold signal allocated — signal helps here' }
    if (silver) return { score: WEIGHT_SIGNAL_SILVER_HELPS, note: 'Silver signal allocated — signal helps here' }
    return { score: WEIGHT_SIGNAL_NONE_HELPS, note: 'Signal helps but none allocated' }
  }
  if (hasSignal) return { score: WEIGHT_SIGNAL_NEUTRAL + 1, note: `${gold ? 'Gold' : 'Silver'} signal allocated` }
  return { score: WEIGHT_SIGNAL_NEUTRAL, note: 'Signal policy neutral or not required' }
}

// ─── Penalty ──────────────────────────────────────────────────────────────────

function scorePenalty(program) {
  const notes = normalize(program.program_notes)
  let penalty = 0
  const flags = []

  if (/yog|year of graduation|graduation year/.test(notes))             { penalty += PENALTY_YOG_PROGRAM;      flags.push('YOG restriction noted') }
  if (/very competitive|highly competitive/.test(notes))                 { penalty += PENALTY_VERY_COMPETITIVE; flags.push('Marked very competitive') }
  if (/no img|not img friendly|does not sponsor img|no imgs/.test(notes)){ penalty += PENALTY_NO_IMG;           flags.push('IMG-unfriendly flag') }
  if (/soaped|soap/.test(notes))                                         { penalty += PENALTY_SOAPED;           flags.push('Program filled via SOAP') }

  penalty = Math.min(penalty, PENALTY_MAX)
  return { score: -penalty, note: penalty > 0 ? `Penalties applied (−${penalty})` : 'No penalty flags', flags }
}

function scoreYogGap(yog) {
  const yr = parseInt(yog, 10)
  if (!yr || yr < 1970) return { score: 0, note: 'No graduation year entered' }
  const gap = new Date().getFullYear() - yr
  if (gap >= 9)  return { score: -PENALTY_YOG_9PLUS, note: `${gap} yrs since graduation — significant gap (−${PENALTY_YOG_9PLUS})` }
  if (gap >= 6)  return { score: -PENALTY_YOG_6_8,   note: `${gap} yrs since graduation — notable gap (−${PENALTY_YOG_6_8})` }
  if (gap >= 4)  return { score: -PENALTY_YOG_4_5,   note: `${gap} yrs since graduation — mild gap (−${PENALTY_YOG_4_5})` }
  return { score: 0, note: `${gap} yrs since graduation — no penalty` }
}

// ─── Visa filter ─────────────────────────────────────────────────────────────

function passesVisaFilter(program, visaNeed) {
  const need = normalize(visaNeed)
  const visa = normalize(program.visa_type)
  const noSponsorship = visa.includes('no sponsorship')
  // No-sponsorship programs are only shown when the applicant does not need a visa.
  if (need === 'none') return true
  if (noSponsorship) return false
  if (need === 'j1')    return visa.includes('j1')
  if (need === 'h1b')   return visa.includes('h1b')
  if (need === 'either') return visa.includes('j1') || visa.includes('h1b')
  return !noSponsorship
}

function scoreVisaStatus(visaNeed) {
  if (normalize(visaNeed) === 'none') {
    return { score: WEIGHT_NO_VISA_BOOST, note: 'No visa sponsorship needed (+12)' }
  }
  return { score: 0, note: null }
}

function assignTier(totalScore, connectionScore) {
  if (connectionScore >= CONNECTION_OVERRIDE_THRESHOLD) return TIER_TARGET
  if (totalScore >= TIER_THRESHOLD_TARGET)  return TIER_TARGET
  if (totalScore >= TIER_THRESHOLD_LIKELY)  return TIER_LIKELY
  if (totalScore >= TIER_THRESHOLD_REACH)   return TIER_REACH
  return TIER_LONG_SHOT
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Pure scoring function — no React, no side effects.
 *
 * @param {object[]} programs
 * @param {{
 *   step2: string, step3: string,
 *   visaNeed: string,
 *   ecfmg: 'certified'|'pending'|'not',
 *   usRotations: 'im_subi'|'im_rotation'|'other_us'|'none',
 *   research: 'multi_high'|'single_high'|'multi_any'|'single_any'|'presentations'|'none',
 * }} profile
 * @param {{ [code: string]: 'gold'|'silver'|null }} signals
 * @param {{ [code: string]: { strength: 'strong'|'moderate'|'weak', count: number, names: string }|null }} connections
 * @returns {object[]}
 */
export function scorePrograms(programs, profile, signals = {}, connections = {}) {
  return programs
    .filter((program) => passesVisaFilter(program, profile.visaNeed))
    .map((program) => {
      try {
        return scoreSingleProgram(program, profile, signals, connections)
      } catch (err) {
        console.error('Failed to score program', program?.program_code, err)
        return {
          ...program,
          computed_score: 0,
          computed_tier: TIER_LONG_SHOT,
          score_breakdown: {},
          flags: [],
          user_has_connection: false,
          user_signal: signals[program.program_code] || null,
        }
      }
    })
}

function scoreSingleProgram(program, profile, signals, connections) {
  const conn = scoreConnection(connections[program.program_code] || null)
  const dowPak      = scoreDowPak(program, profile.medSchool)
  const step2       = scoreStep2(program, profile.step2)
  const step3       = scoreStep3(profile.step3)
  const ecfmg       = scoreEcfmg(profile.ecfmg)
  const visaStatus  = scoreVisaStatus(profile.visaNeed)
  const yogGap      = scoreYogGap(profile.yog)
  const rotations   = scoreRotations(profile, { __code: program.program_code, __state: program.state })
  const erasRegion  = scoreErasRegion(program, profile.erasRegions)
  const research    = scoreResearch(profile.research, program.program_type)
  const programType = scoreProgramType(program)
  const signal      = scoreSignal(program, signals[program.program_code] || null)
  const penalty     = scorePenalty(program)

  const rawScore =
    conn.score + dowPak.score + step2.score + step3.score +
    ecfmg.score + visaStatus.score + yogGap.score + rotations.score + erasRegion.score + research.score +
    programType.score + signal.score + penalty.score

  const computedScore = Math.max(0, Math.min(100, Number.isFinite(rawScore) ? rawScore : 0))
  const computedTier  = assignTier(computedScore, conn.score)

  return {
    ...program,
    computed_score: computedScore,
    computed_tier:  computedTier,
    score_breakdown: {
      connection:  { score: conn.score,          note: conn.note },
      dowPak:      { score: dowPak.score,        note: dowPak.note },
      step2:       { score: step2.score,         note: step2.note },
      step3:       { score: step3.score,         note: step3.note },
      ecfmg:       { score: ecfmg.score,         note: ecfmg.note },
      visaStatus:  { score: visaStatus.score,    note: visaStatus.note },
      yogGap:      { score: yogGap.score,        note: yogGap.note },
      rotations:   { score: rotations.score,     note: rotations.note },
      erasRegion:  { score: erasRegion.score,    note: erasRegion.note },
      research:    { score: research.score,      note: research.note },
      programType: { score: programType.score,  note: programType.note },
      signal:      { score: signal.score,       note: signal.note },
      penalty:     { score: penalty.score,      note: penalty.note },
    },
    flags:              penalty.flags,
    user_has_connection: conn.hasConnection,
    user_signal:         signals[program.program_code] || null,
  }
}
