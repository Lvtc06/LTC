import { supabase } from './supabase'
import type { Activity, ActivityUser, DailyRecord, LeaderboardRow, Profile } from '../types'
import { todayCN } from '../utils/date'

const fail = (error: { message?: string } | null) => { if (error) throw new Error(error.message || '请求失败') }
export async function getProfile(id: string) { const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single(); fail(error); return data as Profile }
export async function getActiveActivity(userId: string) {
  const { data, error } = await supabase.from('activity_users').select('*, activities(*)').eq('user_id', userId).order('joined_at', { ascending: false }).limit(1).maybeSingle(); fail(error)
  return data ? { membership: data as ActivityUser, activity: data.activities as Activity } : { membership: null, activity: null }
}
export async function getRecords(userId: string, activityId: number) { const { data, error } = await supabase.from('daily_records').select('*').eq('user_id', userId).eq('activity_id', activityId).order('record_date', { ascending: false }); fail(error); return (data || []) as DailyRecord[] }
export async function saveToday(record: DailyRecord) { const { data, error } = await supabase.from('daily_records').upsert(record, { onConflict: 'user_id,activity_id,record_date' }).select().single(); fail(error); return data as DailyRecord }
export async function getLeaderboard(activityId: number) { const { data, error } = await supabase.rpc('get_activity_leaderboard', { p_activity_id: activityId }); fail(error); return (data || []) as LeaderboardRow[] }
export async function getAdminUsers() { const { data, error } = await supabase.from('profiles').select('*').order('created_at'); fail(error); return (data || []) as Profile[] }
export async function getAdminRecords(activityId?: number) { let q = supabase.from('daily_records').select('*, profiles(nickname)').order('record_date', { ascending: false }); if (activityId) q = q.eq('activity_id', activityId); const { data, error } = await q; fail(error); return data || [] }
export async function deleteRecord(id: number) { const { error } = await supabase.from('daily_records').delete().eq('id', id); fail(error) }
export async function updateProfile(id: string, values: Partial<Profile>) { const { error } = await supabase.from('profiles').update(values).eq('id', id); fail(error) }
export async function saveActivity(values: Partial<Activity>) { const { data, error } = await supabase.from('activities').upsert(values).select().single(); fail(error); return data as Activity }
export const recordTemplate = (userId: string, activityId: number): DailyRecord => ({ user_id: userId, activity_id: activityId, record_date: todayCN(), weight: 0, breakfast_status: '正常', lunch_status: '正常', dinner_status: '正常', exercised: false, exercise_type: '', exercise_minutes: 0, water_ml: 0, sleep_hours: 8, completed: true, remark: '' })
