export type Role = 'user' | 'admin'
export type MealStatus = '正常' | '少吃' | '未吃' | '超量'

export interface Profile {
  id: string; username: string; nickname: string; initial_weight: number
  target_weight: number; role: Role; status: string
}
export interface Activity {
  id: number; activity_name: string; start_date: string; end_date: string
  target_loss: number; status: string
}
export interface ActivityUser {
  id: number; activity_id: number; user_id: string; initial_weight: number; target_weight: number
}
export interface DailyRecord {
  id?: number; user_id: string; activity_id: number; record_date: string; weight: number
  breakfast_status: MealStatus; lunch_status: MealStatus; dinner_status: MealStatus
  exercised: boolean; exercise_type: string; exercise_minutes: number; water_ml: number
  sleep_hours: number; completed: boolean; remark: string; created_at?: string; updated_at?: string
}
export interface DashboardData {
  activity: Activity | null; membership: ActivityUser | null; latest: DailyRecord | null
  today: DailyRecord | null; records: DailyRecord[]
}
export interface LeaderboardRow {
  user_id: string; nickname: string; initial_weight: number; current_weight: number
  total_loss: number; loss_rate: number; checkin_days: number; streak_days: number; checked_today: boolean
}
