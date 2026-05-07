<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('onboarding.title') }}</h1>
      <p class="text-slate-600 dark:text-slate-300">
        {{ t('onboarding.subtitle') }}
      </p>
    </header>

    <form class="space-y-6" @submit.prevent="submit">
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 class="text-base font-semibold">{{ t('onboarding.step1') }}</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.startDate') }}</span>
            <input v-model="startDateISO" type="date" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950" />
          </label>
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.currency') }}</span>
            <select
              v-model="currencyChoice"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              @change="currencyTouched = true"
            >
              <option v-for="c in popularCurrencies" :key="c.code" :value="c.code">
                {{ c.code }} — {{ c.label }}
              </option>
              <option value="__other__">{{ t('onboarding.otherCurrency') }}</option>
            </select>

            <input
              v-if="currencyChoice === '__other__'"
              v-model="customCurrency"
              inputmode="text"
              maxlength="8"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              :placeholder="t('onboarding.otherCurrencyPlaceholder')"
              aria-label="Custom currency code"
              @input="currencyTouched = true"
            />
          </label>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 class="text-base font-semibold">{{ t('onboarding.step2') }}</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.startAmount') }}</span>
            <input v-model="startAmount" inputmode="decimal" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950" placeholder="50" />
          </label>
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.increment') }}</span>
            <input v-model="increment" inputmode="decimal" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950" placeholder="50" />
          </label>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 class="text-base font-semibold">{{ t('onboarding.step3') }}</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.durationWeeks') }}</span>
            <input v-model.number="durationWeeks" type="number" min="1" max="520" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950" />
          </label>
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('onboarding.goalOptional') }}</span>
            <input v-model="goalAmount" inputmode="decimal" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950" placeholder="e.g. 1000" />
          </label>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 class="text-base font-semibold">{{ t('onboarding.preview') }}</h2>
        <div class="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
          <div class="flex items-center justify-between gap-3">
            <span class="text-slate-600 dark:text-slate-300">{{ t('onboarding.projectedTotal') }}</span>
            <span class="font-semibold tabular-nums">{{ projectedLabel }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-slate-600 dark:text-slate-300">{{ t('onboarding.peakWeekly') }}</span>
            <span class="font-semibold tabular-nums">{{ peakWeeklyLabel }}</span>
          </div>
          <div class="mt-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <div class="font-semibold text-slate-700 dark:text-slate-200">{{ t('onboarding.peakMonths') }}</div>
            <ul class="mt-2 space-y-1">
              <li v-for="m in peak" :key="m.monthISO" class="flex items-center justify-between gap-3">
                <span class="tabular-nums">{{ m.monthISO }}</span>
                <span class="font-semibold tabular-nums">{{ formatCents(m.totalCents, previewSettings.currency) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <MonthlyBreakdown :key="previewSettings.currency" :months="breakdown" :currency="previewSettings.currency" />

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {{ t('onboarding.startTracking') }}
        </button>
        <p v-if="error" class="text-sm text-rose-600 dark:text-rose-400" role="alert">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useChallengeStore } from '~/stores/challenge'
import { useI18n } from '~/composables/useI18n'
import { parseAmountToCents, formatCents, currencySymbol } from '~/utils/money'
import { projectedTotalCents, weekAmountCents, monthlyBreakdown, peakMonths } from '~/utils/challenge'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'
import { defaultCurrencyForLocale } from '~/utils/locale-currency'
import type { AppSettings } from '~/types/challenge'

type AppSettingsLocale = AppSettings['locale']

const challengeStore = useChallengeStore()
const auth = useAuthStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const today = new Date()
const pad2 = (n: number) => String(n).padStart(2, '0')
const startDateISO = ref(`${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`)

const popularCurrencies = [
  { code: 'USD', label: `${currencySymbol('USD')} US Dollar` },
  { code: 'EUR', label: `${currencySymbol('EUR')} Euro` },
  { code: 'GBP', label: `${currencySymbol('GBP')} British Pound` },
  { code: 'ISK', label: `${currencySymbol('ISK')} Icelandic Króna` },
  { code: 'BDT', label: `${currencySymbol('BDT')} Bangladeshi Taka` },
  { code: 'INR', label: `${currencySymbol('INR')} Indian Rupee` },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'CNY', label: 'Chinese Yuan' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'SAR', label: 'Saudi Riyal' }
] as const

const currencyTouched = ref(false)
const currencyChoice = ref<(typeof popularCurrencies)[number]['code'] | '__other__'>(
  defaultCurrencyForLocale(settingsStore.locale) as any
)
const customCurrency = ref('')

watch(
  () => settingsStore.locale,
  (loc: AppSettingsLocale) => {
    if (currencyTouched.value) return
    currencyChoice.value = defaultCurrencyForLocale(loc) as any
    customCurrency.value = ''
  }
)

const currency = computed(() => {
  const raw = currencyChoice.value === '__other__' ? customCurrency.value : currencyChoice.value
  const normalized = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 8)
  return normalized || 'USD'
})

const startAmount = ref('50')
const increment = ref('50')
const durationWeeks = ref(52)
const goalAmount = ref('')
const error = ref('')

// Restore draft after login.
if (!import.meta.server) {
  try {
    const raw = localStorage.getItem('pending_challenge_setup')
    if (raw) {
      const s = JSON.parse(raw)
      if (s?.startDateISO) startDateISO.value = String(s.startDateISO)
      if (s?.currency) {
        const code = String(s.currency).toUpperCase()
        const isPopular = popularCurrencies.some((c) => c.code === code)
        currencyChoice.value = isPopular ? (code as any) : '__other__'
        if (!isPopular) customCurrency.value = code
      }
      if (typeof s?.durationWeeks === 'number') durationWeeks.value = s.durationWeeks
      if (s?.startAmountCents != null) startAmount.value = (BigInt(s.startAmountCents) / 100n).toString()
      if (s?.weeklyIncrementCents != null) increment.value = (BigInt(s.weeklyIncrementCents) / 100n).toString()
      if (s?.goalAmountCents != null) goalAmount.value = (BigInt(s.goalAmountCents) / 100n).toString()
    }
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('pending_challenge_setup')
  }
}

const previewSettings = computed(() => {
  const startCents = parseAmountToCents(startAmount.value || '0')
  const incCents = parseAmountToCents(increment.value || '0')
  const dur = Math.max(1, Math.trunc(durationWeeks.value || 1))
  return {
    startDateISO: startDateISO.value,
    currency: currency.value,
    startAmountCents: startCents,
    weeklyIncrementCents: incCents,
    durationWeeks: dur,
    goalAmountCents: goalAmount.value.trim() ? parseAmountToCents(goalAmount.value) : undefined,
    missedHandling: 'keep_end_date' as const
  }
})

const projectedLabel = computed(() => formatCents(projectedTotalCents({ ...previewSettings.value, id: 'x', createdAtISO: '' }), previewSettings.value.currency))
const peakWeeklyLabel = computed(() => {
  const s = { ...previewSettings.value, id: 'x', createdAtISO: '' }
  const peak = weekAmountCents(s, s.durationWeeks)
  return formatCents(peak, s.currency)
})

const breakdown = computed(() => {
  const s = { ...previewSettings.value, id: 'x', createdAtISO: '' }
  return monthlyBreakdown(s)
})

const peak = computed(() => {
  const s = { ...previewSettings.value, id: 'x', createdAtISO: '' }
  return peakMonths(s, 3)
})

async function submit() {
  error.value = ''
  try {
    const s = previewSettings.value
    // Gate: require login to start tracking, but keep setup draft.
    if (!auth.isAuthenticated) {
      if (!import.meta.server) {
        localStorage.setItem(
          'pending_challenge_setup',
          JSON.stringify({
            ...s,
            startAmountCents: s.startAmountCents.toString(),
            weeklyIncrementCents: s.weeklyIncrementCents.toString(),
            goalAmountCents: s.goalAmountCents?.toString()
          })
        )
      }
      await navigateTo('/login?redirect=/onboarding')
      return
    }

    challengeStore.configureChallenge(s)
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.message || 'Could not create challenge'
  }
}
</script>

