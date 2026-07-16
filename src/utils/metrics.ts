import type { DailyRecord } from '../types'
import { daysBetween, todayCN } from './date'

export const currentWeight = (initial: number, records: DailyRecord[]) => records[0]?.weight ?? initial
export const totalLoss = (initial: number, current: number) => +(initial - current).toFixed(1)
export const lossRate = (initial: number, loss: number) => initial ? +(loss / initial * 100).toFixed(2) : 0
export function streak(records: DailyRecord[]) {
  const dates = new Set(records.map(r => r.record_date)); let cursor = todayCN()
  if (!dates.has(cursor)) cursor = new Date(Date.parse(`${cursor}T00:00:00+08:00`) - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
  let count = 0
  while (dates.has(cursor)) { count++; cursor = new Date(Date.parse(`${cursor}T00:00:00+08:00`) - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }) }
  return count
}
export const remainingDays = (end: string) => Math.max(0, daysBetween(todayCN(), end))
