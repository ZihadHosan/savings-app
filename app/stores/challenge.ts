import { defineStore } from 'pinia'
import type { ChallengeProgress, ChallengeSettings, PersistedStateV1 } from '~/types/challenge'
import { cumulativePaidCents, computeStreak, projectedTotalCents, weekAmountCents, weekDateISO } from '~/utils/challenge'

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export const useChallengeStore = defineStore('challenge', {
  state: () => ({
    challenge: undefined as ChallengeSettings | undefined,
    progress: undefined as ChallengeProgress | undefined
  }),

  getters: {
    isConfigured: (s) => !!s.challenge,

    projectedTotalCents: (s) => (s.challenge ? projectedTotalCents(s.challenge) : 0n),

    paidTotalCents: (s) => (s.challenge && s.progress ? cumulativePaidCents(s.challenge, s.progress.weeks) : 0n),

    remainingCents(): bigint {
      if (!this.challenge) return 0n
      const projected = projectedTotalCents(this.challenge)
      const paid = this.paidTotalCents
      return projected > paid ? projected - paid : 0n
    },

    percentComplete(): number {
      if (!this.challenge) return 0
      const projected = this.projectedTotalCents
      if (projected <= 0n) return 0
      const paid = this.paidTotalCents
      const pct = Number((paid * 10000n) / projected) / 100
      return Math.max(0, Math.min(100, pct))
    },

    weekAmountCents: (s) => (weekIndex: number) => (s.challenge ? weekAmountCents(s.challenge, weekIndex) : 0n),
    weekDateISO: (s) => (weekIndex: number) => (s.challenge ? weekDateISO(s.challenge, weekIndex) : ''),

    durationWeeks: (s) => s.challenge?.durationWeeks || 0,

    streakCurrent: (s) => s.progress?.streakCurrent || 0,
    streakBest: (s) => s.progress?.streakBest || 0
  },

  actions: {
    initFromPersisted(persisted: PersistedStateV1) {
      this.challenge = persisted.challenge
      this.progress = persisted.progress
    },

    resetAll() {
      this.challenge = undefined
      this.progress = undefined
    },

    setCurrency(code: string) {
      if (!this.challenge) return
      const next = String(code || '').trim().toUpperCase()
      if (!next || next === this.challenge.currency) return
      this.challenge = { ...this.challenge, currency: next }
    },

    configureChallenge(input: Omit<ChallengeSettings, 'id' | 'createdAtISO'>) {
      // Validation (runtime safety; UI also guards)
      if (input.durationWeeks <= 0) throw new Error('Duration must be at least 1 week')
      if (input.startAmountCents < 0n) throw new Error('Start amount must be >= 0')
      if (input.weeklyIncrementCents < 0n) throw new Error('Increment must be >= 0')

      this.challenge = {
        ...input,
        id: uid(),
        createdAtISO: new Date().toISOString()
      }
      this.progress = {
        weeks: {},
        streakCurrent: 0,
        streakBest: 0,
        lastPaidWeekIndex: undefined
      }
    },

    markWeekPaid(weekIndex: number, unitsPaid = 1) {
      if (!this.challenge) throw new Error('Challenge not configured')
      if (!this.progress) throw new Error('Progress not initialized')
      const w = Math.max(1, Math.trunc(weekIndex))
      const units = Math.max(1, Math.trunc(unitsPaid))

      this.progress.weeks[w] = {
        weekIndex: w,
        status: 'paid',
        paidAtISO: new Date().toISOString(),
        unitsPaid: units
      }

      const streak = computeStreak(this.progress.weeks)
      this.progress.streakCurrent = streak.current
      this.progress.streakBest = Math.max(this.progress.streakBest, streak.best)
      this.progress.lastPaidWeekIndex = streak.lastPaidWeekIndex
    },

    unmarkWeekPaid(weekIndex: number) {
      if (!this.progress) return
      const w = Math.max(1, Math.trunc(weekIndex))
      delete this.progress.weeks[w]
      const streak = computeStreak(this.progress.weeks)
      this.progress.streakCurrent = streak.current
      this.progress.streakBest = Math.max(this.progress.streakBest, streak.best)
      this.progress.lastPaidWeekIndex = streak.lastPaidWeekIndex
    }
  }
})

