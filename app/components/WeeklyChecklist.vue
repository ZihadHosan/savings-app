<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">{{ t('checklist.title') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('checklist.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-slate-600 dark:text-slate-300" for="viewMode">{{ t('common.view') }}</label>
        <select
          id="viewMode"
          v-model="mode"
          class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="weekly">{{ t('common.weekly') }}</option>
          <option value="monthly">{{ t('common.monthly') }}</option>
        </select>
      </div>
    </div>

    <div v-if="!challenge" class="mt-4 text-sm text-slate-600 dark:text-slate-300">
      {{ t('checklist.empty') }}
    </div>

    <div v-else class="mt-4">
      <div v-if="mode === 'monthly'" class="text-sm text-slate-600 dark:text-slate-300">
        Monthly view is scaffolded. (Next: aggregate weeks into months with difficulty labels + peak months.)
      </div>

      <ol v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <li
          v-for="w in weeksToShow"
          :key="w.weekIndex"
          class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">{{ t('common.week') }} {{ w.weekIndex }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ w.dateISO }}</span>
            </div>
            <div class="text-sm tabular-nums">{{ w.amountLabel }}</div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:hover:bg-slate-900"
              :aria-pressed="w.paid"
              @click="togglePaid(w.weekIndex)"
            >
              {{ w.paid ? t('common.paid') : t('common.markPaid') }}
            </button>

            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:hover:bg-slate-900"
              :disabled="w.paid"
              @click="doubleUp(w.weekIndex)"
              aria-label="Pay double for this week"
              title="Double-up (2×)"
            >
              2×
            </button>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChallengeStore } from '~/stores/challenge'
import { useSettingsStore } from '~/stores/settings'
import { useI18n } from '~/composables/useI18n'
import { formatCents } from '~/utils/money'

const challengeStore = useChallengeStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const mode = ref<'weekly' | 'monthly'>('weekly')

const challenge = computed(() => challengeStore.challenge)
const progress = computed(() => challengeStore.progress)

const weeksToShow = computed(() => {
  if (!challenge.value) return []
  const currency = challenge.value.currency
  const locale = settingsStore.locale
  const n = challenge.value.durationWeeks
  const weeks: Array<{ weekIndex: number; dateISO: string; paid: boolean; amountLabel: string }> = []
  for (let i = 1; i <= n; i++) {
    const paid = progress.value?.weeks?.[i]?.status === 'paid'
    const amount = challengeStore.weekAmountCents(i)
    weeks.push({
      weekIndex: i,
      dateISO: challengeStore.weekDateISO(i),
      paid,
      amountLabel: formatCents(amount, currency, locale)
    })
  }
  return weeks
})

function togglePaid(weekIndex: number) {
  const paid = progress.value?.weeks?.[weekIndex]?.status === 'paid'
  if (paid) challengeStore.unmarkWeekPaid(weekIndex)
  else challengeStore.markWeekPaid(weekIndex, 1)
}

function doubleUp(weekIndex: number) {
  challengeStore.markWeekPaid(weekIndex, 2)
}
</script>

