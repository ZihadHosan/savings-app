import type { PersistedStateV1 } from '~/types/challenge'
import { z } from 'zod'

const KEY = 'savings_challenge_state'

const persistedSchemaV1 = z.object({
  version: z.literal(1),
  settings: z.object({
    locale: z.union([z.literal('en'), z.literal('bn'), z.literal('is')]),
    theme: z.union([z.literal('system'), z.literal('light'), z.literal('dark')]),
    remindersEnabled: z.boolean()
  }),
  challenge: z
    .object({
      id: z.string(),
      createdAtISO: z.string(),
      startDateISO: z.string(),
      currency: z.string(),
      startAmountCents: z.string(), // bigint serialized
      weeklyIncrementCents: z.string(),
      durationWeeks: z.number().int(),
      goalAmountCents: z.string().optional(),
      missedHandling: z.union([z.literal('keep_end_date'), z.literal('extend_duration')])
    })
    .optional(),
  progress: z
    .object({
      weeks: z.record(
        z.string(),
        z.object({
          weekIndex: z.number().int(),
          status: z.union([z.literal('pending'), z.literal('paid')]),
          paidAtISO: z.string().optional(),
          unitsPaid: z.number().int()
        })
      ),
      streakCurrent: z.number().int(),
      streakBest: z.number().int(),
      lastPaidWeekIndex: z.number().int().optional()
    })
    .optional()
})

export function loadPersistedState(): PersistedStateV1 | null {
  if (import.meta.server) return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const v = persistedSchemaV1.safeParse(parsed)
    if (!v.success) return null

    const data = v.data
    return {
      version: 1,
      settings: data.settings,
      challenge: data.challenge
        ? {
            ...data.challenge,
            startAmountCents: BigInt(data.challenge.startAmountCents),
            weeklyIncrementCents: BigInt(data.challenge.weeklyIncrementCents),
            goalAmountCents: data.challenge.goalAmountCents ? BigInt(data.challenge.goalAmountCents) : undefined
          }
        : undefined,
      progress: data.progress
        ? {
            ...data.progress,
            weeks: Object.fromEntries(
              Object.entries(data.progress.weeks).map(([k, e]) => [Number(k), e])
            )
          }
        : undefined
    }
  } catch {
    return null
  }
}

export function savePersistedState(state: PersistedStateV1) {
  if (import.meta.server) return
  const payload = {
    version: 1,
    settings: state.settings,
    challenge: state.challenge
      ? {
          ...state.challenge,
          startAmountCents: state.challenge.startAmountCents.toString(),
          weeklyIncrementCents: state.challenge.weeklyIncrementCents.toString(),
          goalAmountCents: state.challenge.goalAmountCents?.toString()
        }
      : undefined,
    progress: state.progress
      ? {
          ...state.progress,
          weeks: Object.fromEntries(Object.entries(state.progress.weeks).map(([k, e]) => [String(k), e]))
        }
      : undefined
  }
  localStorage.setItem(KEY, JSON.stringify(payload))
}

