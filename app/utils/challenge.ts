import type { ChallengeSettings, Difficulty, WeekEntry, WeekStatus } from '~/types/challenge'
import { assertNonNegativeCents } from '~/utils/money'

export function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

export function weekAmountCents(settings: ChallengeSettings, weekIndex: number): bigint {
  const w = BigInt(Math.max(1, Math.trunc(weekIndex)) - 1)
  return settings.startAmountCents + w * settings.weeklyIncrementCents
}

export function projectedTotalCents(settings: ChallengeSettings): bigint {
  assertNonNegativeCents(settings.startAmountCents, 'Start amount')
  // weeklyIncrement can be 0, but not negative.
  assertNonNegativeCents(settings.weeklyIncrementCents, 'Weekly increment')
  if (settings.durationWeeks <= 0) return 0n

  // Sum of arithmetic series: n/2 * (2a + (n-1)d)
  const n = BigInt(settings.durationWeeks)
  const twoA = 2n * settings.startAmountCents
  const nMinus1 = n - 1n
  const d = settings.weeklyIncrementCents
  return (n * (twoA + nMinus1 * d)) / 2n
}

export function toISODate(d: Date): string {
  // YYYY-MM-DD in local time
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(dateISO: string, days: number): string {
  const parts = dateISO.split('-').map((v) => Number(v))
  const y = parts[0] ?? 1970
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toISODate(dt)
}

export function weekDateISO(settings: ChallengeSettings, weekIndex: number): string {
  // Week 1 = startDate; Week k = startDate + 7*(k-1)
  const offsetDays = (Math.max(1, Math.trunc(weekIndex)) - 1) * 7
  return addDaysISO(settings.startDateISO, offsetDays)
}

export function statusForWeek(weeks: Record<number, WeekEntry>, weekIndex: number): WeekStatus {
  const entry = weeks[weekIndex]
  return entry?.status || 'pending'
}

export function computeStreak(weeks: Record<number, WeekEntry>): { current: number; best: number; lastPaidWeekIndex?: number } {
  const paidWeekIndices = Object.keys(weeks)
    .map(Number)
    .filter((k) => weeks[k]?.status === 'paid')
    .sort((a, b) => a - b)

  if (paidWeekIndices.length === 0) return { current: 0, best: 0, lastPaidWeekIndex: undefined }

  let best = 1
  let current = 1
  for (let i = 1; i < paidWeekIndices.length; i++) {
    const prev = paidWeekIndices[i - 1]!
    const cur = paidWeekIndices[i]!
    if (cur === prev + 1) {
      current++
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }
  return { current, best, lastPaidWeekIndex: paidWeekIndices[paidWeekIndices.length - 1] }
}

export function cumulativePaidCents(settings: ChallengeSettings, weeks: Record<number, WeekEntry>): bigint {
  let total = 0n
  for (const [k, entry] of Object.entries(weeks)) {
    const weekIndex = Number(k)
    if (!entry || entry.status !== 'paid') continue
    const units = Math.max(1, Math.trunc(entry.unitsPaid || 1))
    total += weekAmountCents(settings, weekIndex) * BigInt(units)
  }
  return total
}

export function monthlyDifficulty(weeklyTotalsCents: bigint[]): Difficulty[] {
  // Input is 12 monthly totals for the challenge span; difficulty based on percentile thresholds.
  const sorted = [...weeklyTotalsCents].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const q1 = sorted[Math.floor(sorted.length * 0.25)] || 0n
  const q2 = sorted[Math.floor(sorted.length * 0.5)] || 0n
  const q3 = sorted[Math.floor(sorted.length * 0.75)] || 0n
  return weeklyTotalsCents.map((v) => {
    if (v <= q1) return 'easy'
    if (v <= q2) return 'moderate'
    if (v <= q3) return 'challenging'
    return 'very_hard'
  })
}

export interface MonthlyBreakdownItem {
  monthISO: string // YYYY-MM
  totalCents: bigint
  difficulty: Difficulty
  weeks: number[]
}

export function monthlyBreakdown(settings: ChallengeSettings): MonthlyBreakdownItem[] {
  const byMonth = new Map<string, { total: bigint; weeks: number[] }>()
  for (let i = 1; i <= settings.durationWeeks; i++) {
    const dateISO = weekDateISO(settings, i)
    const monthISO = dateISO.slice(0, 7)
    const cur = byMonth.get(monthISO) || { total: 0n, weeks: [] }
    cur.total += weekAmountCents(settings, i)
    cur.weeks.push(i)
    byMonth.set(monthISO, cur)
  }

  const months = [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([monthISO, v]) => ({ monthISO, totalCents: v.total, weeks: v.weeks }))

  const diffs = monthlyDifficulty(months.map((m) => m.totalCents))
  return months.map((m, idx) => ({ ...m, difficulty: diffs[idx] ?? 'easy' }))
}

export function peakMonths(settings: ChallengeSettings, topN = 3): MonthlyBreakdownItem[] {
  const months = monthlyBreakdown(settings)
  return [...months].sort((a, b) => (a.totalCents < b.totalCents ? 1 : a.totalCents > b.totalCents ? -1 : 0)).slice(0, topN)
}

