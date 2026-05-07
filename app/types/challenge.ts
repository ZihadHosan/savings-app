export type CurrencyCode = string

export type Difficulty = 'easy' | 'moderate' | 'challenging' | 'very_hard'

export type WeekStatus = 'pending' | 'paid'

export type MissedHandling = 'keep_end_date' | 'extend_duration'

export interface ChallengeSettings {
  id: string
  createdAtISO: string

  // Onboarding inputs
  startDateISO: string // local date in ISO YYYY-MM-DD
  currency: CurrencyCode
  startAmountCents: bigint
  weeklyIncrementCents: bigint
  durationWeeks: number

  // Optional goal to compare against projected totals
  goalAmountCents?: bigint

  // How missed weeks affect the schedule when "double-up" is used.
  missedHandling: MissedHandling
}

export interface WeekEntry {
  weekIndex: number // 1..durationWeeks (+ extensions)
  status: WeekStatus
  paidAtISO?: string // timestamp when marked paid
  // How many "units" of this week were paid (double-up pays 2+ units)
  unitsPaid: number
}

export interface ChallengeProgress {
  // Map by weekIndex; missing entries are implicitly pending.
  weeks: Record<number, WeekEntry>

  // Streak tracking
  streakCurrent: number
  streakBest: number
  lastPaidWeekIndex?: number
}

export interface TipItem {
  id: string
  title: string
  body: string
  tags: string[]
}

export interface AppSettings {
  locale: 'en' | 'bn' | 'is'
  theme: 'system' | 'light' | 'dark'
  remindersEnabled: boolean
}

export interface PersistedStateV1 {
  version: 1
  settings: AppSettings
  challenge?: ChallengeSettings
  progress?: ChallengeProgress
}

