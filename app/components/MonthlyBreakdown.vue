<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">{{ t('monthlyBreakdown.title') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('monthlyBreakdown.subtitle') }}</p>
      </div>
    </div>

    <ol class="mt-4 space-y-2">
      <li v-for="m in months" :key="m.monthISO" class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div class="min-w-0">
          <div class="text-sm font-semibold tabular-nums">{{ m.monthISO }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">{{ t('monthlyBreakdown.weeks') }}: {{ m.weeks.join(', ') }}</div>
        </div>
        <div class="flex items-center gap-3">
          <BadgePill :variant="variantFor(m.difficulty)">{{ labelFor(m.difficulty) }}</BadgePill>
          <div class="text-sm font-semibold tabular-nums">{{ formatCents(m.totalCents, currency, locale) }}</div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { Difficulty } from '~/types/challenge'
import type { MonthlyBreakdownItem } from '~/utils/challenge'
import { formatCents } from '~/utils/money'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

defineProps<{
  months: MonthlyBreakdownItem[]
  currency: string
  locale?: string
}>()

function labelFor(d: Difficulty) {
  switch (d) {
    case 'easy':
      return t('difficulty.easy')
    case 'moderate':
      return t('difficulty.moderate')
    case 'challenging':
      return t('difficulty.challenging')
    case 'very_hard':
      return t('difficulty.veryHard')
  }
}

function variantFor(d: Difficulty) {
  switch (d) {
    case 'easy':
      return 'success'
    case 'moderate':
      return 'info'
    case 'challenging':
      return 'warning'
    case 'very_hard':
      return 'warning'
  }
}
</script>

