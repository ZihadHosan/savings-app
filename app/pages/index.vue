<template>
  <div class="space-y-6">
    <ClientOnly>
      <div
        v-if="!isAuthed || !challengeStore.isConfigured"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('dashboard.welcomeTitle') }}</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ isAuthed ? t('dashboard.welcomeBody') : t('dashboard.signInPrompt') }}
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <NuxtLink
            v-if="!isAuthed"
            to="/login"
            class="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {{ t('auth.login') }}
          </NuxtLink>
          <NuxtLink
            to="/onboarding"
            class="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            :class="isAuthed
              ? 'bg-sky-500 text-white hover:bg-sky-600'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900'"
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

      <template #fallback>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div class="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div class="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Difficulty } from '~/types/challenge'
import { useChallengeStore } from '~/stores/challenge'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from '~/composables/useI18n'
import { formatCents } from '~/utils/money'
import { projectedTotalCents, weekAmountCents, monthlyBreakdown } from '~/utils/challenge'

const challengeStore = useChallengeStore()
const settingsStore = useSettingsStore()
const auth = useAuthStore()
const { t } = useI18n()

const isAuthed = computed(() => auth.isAuthenticated)

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

