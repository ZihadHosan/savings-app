<template>
  <div class="space-y-6">
    <div v-if="!challengeStore.isConfigured" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('dashboard.welcomeTitle') }}</h1>
      <p class="mt-2 text-slate-600 dark:text-slate-300">
        {{ t('dashboard.welcomeBody') }}
      </p>
      <div class="mt-4">
        <NuxtLink
          to="/onboarding"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {{ t('dashboard.startSetup') }}
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ t('dashboard.title') }}</h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {{ t('dashboard.subtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/onboarding"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            {{ t('dashboard.editSetup') }}
          </NuxtLink>
        </div>
      </header>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <ProgressRing
            :percent="challengeStore.percentComplete"
            :label="t('dashboard.totalSaved')"
            :value="paidLabel"
            :subvalue="`${t('common.remaining')}: ${remainingLabel}`"
          />
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <BadgePill variant="info">{{ t('dashboard.streak') }}: {{ challengeStore.streakCurrent }}</BadgePill>
              <BadgePill>{{ t('dashboard.best') }}: {{ challengeStore.streakBest }}</BadgePill>
            </div>
            <MilestonesRow :percent="challengeStore.percentComplete" />
          </div>
        </div>

        <ProgressChart :points="projectionPoints" />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <WeeklyChecklist />
        <TipsPanel :difficulty="difficulty" />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Difficulty } from '~/types/challenge'
import { useChallengeStore } from '~/stores/challenge'
import { useSettingsStore } from '~/stores/settings'
import { useI18n } from '~/composables/useI18n'
import { formatCents } from '~/utils/money'
import { projectedTotalCents, weekAmountCents, monthlyBreakdown } from '~/utils/challenge'

const challengeStore = useChallengeStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const currency = computed(() => challengeStore.challenge?.currency || 'USD')
const locale = computed(() => settingsStore.locale)

const paidLabel = computed(() => formatCents(challengeStore.paidTotalCents, currency.value, locale.value))
const remainingLabel = computed(() => formatCents(challengeStore.remainingCents, currency.value, locale.value))

const projectionPoints = computed(() => {
  const c = challengeStore.challenge
  if (!c) return []
  const projected = projectedTotalCents(c)
  if (projected <= 0n) return []
  // Build cumulative projection points (weekly).
  const pts: number[] = []
  let sum = 0n
  for (let i = 1; i <= c.durationWeeks; i++) {
    sum += weekAmountCents(c, i)
    // For chart placeholder we can safely clamp to JS number scale using percent.
    pts.push(Number((sum * 10000n) / projected) / 100)
  }
  return pts
})

const difficulty = computed<Difficulty>(() => {
  const c = challengeStore.challenge
  if (!c) return 'easy'
  const months = monthlyBreakdown(c)
  const nowMonth = new Date()
  const m = `${nowMonth.getFullYear()}-${String(nowMonth.getMonth() + 1).padStart(2, '0')}`
  const hit = months.find((x) => x.monthISO === m)
  return hit?.difficulty || months[0]?.difficulty || 'easy'
})
</script>

