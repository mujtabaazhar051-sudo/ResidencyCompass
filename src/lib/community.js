import { isSupabaseConfigured, supabase } from './supabase'

export async function submitIvReport(payload, userId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }

  const { error } = await supabase.from('iv_reports').insert({
    user_id: userId,
    program_code: payload.program_code,
    program_name: payload.program_name ?? null,
    cycle: payload.cycle ?? null,
    step2: payload.step2,
    step3: payload.step3?.trim() || null,
    med_school: payload.med_school ?? null,
    yog: payload.yog || null,
    visa: payload.visa ?? null,
    research: payload.research ?? null,
    rotation_months: payload.rotation_months ? parseInt(payload.rotation_months, 10) : null,
    got_invite: payload.got_invite,
    signal: payload.signal,
    connection: payload.connection,
    notes: payload.notes?.trim() || null,
    contact_email: payload.contact?.trim() || null,
  })

  if (error) throw error
}

export async function submitCommunityReport(payload, userId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }

  const { error } = await supabase.from('community_reports').insert({
    user_id: userId,
    report_type: payload.type,
    program_code: payload.program_code || null,
    program_name: payload.program_name ?? null,
    description: payload.description.trim(),
    contact_email: payload.contact?.trim() || null,
  })

  if (error) throw error
}

export async function fetchSubmissionCounts(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { iv: 0, reports: 0 }
  }

  const [iv, reports] = await Promise.all([
    supabase.from('iv_reports').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('community_reports').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return {
    iv: iv.count ?? 0,
    reports: reports.count ?? 0,
  }
}
