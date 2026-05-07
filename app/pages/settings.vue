<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('settings.title') }}</h1>
      <p class="text-slate-600 dark:text-slate-300">
        {{ t('settings.subtitle') }}
      </p>
    </header>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 class="text-base font-semibold">{{ t('settings.preferences') }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('settings.theme') }}</span>
          <select
            :value="settings.theme"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            @change="onThemeChange"
          >
            <option value="system">{{ t('settings.system') }}</option>
            <option value="light">{{ t('settings.light') }}</option>
            <option value="dark">{{ t('settings.dark') }}</option>
          </select>
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('settings.language') }}</span>
          <select
            :value="settings.locale"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            @change="onLocaleChange"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
            <option value="is">Íslenska</option>
          </select>
        </label>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 class="text-base font-semibold">{{ t('settings.cloudSync') }}</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {{ t('settings.cloudHelp') }}
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:hover:bg-slate-900"
          @click="pull"
        >
          {{ t('settings.pull') }}
        </button>
        <button
          type="button"
          class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          @click="push"
        >
          {{ t('settings.push') }}
        </button>

        <span v-if="sync.status !== 'idle'" class="text-sm text-slate-600 dark:text-slate-300">
          {{ t('settings.status') }}: {{ sync.status }}
        </span>
        <span v-if="sync.lastError" class="text-sm text-rose-600 dark:text-rose-400" role="alert">
          {{ sync.lastError }}
        </span>
      </div>
    </section>

    <section class="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30">
      <h2 class="text-base font-semibold text-rose-800 dark:text-rose-200">{{ t('settings.dangerZone') }}</h2>
      <p class="mt-1 text-sm text-rose-700 dark:text-rose-300">{{ t('settings.dangerHelp') }}</p>
      <div class="mt-4">
        <button
          type="button"
          class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          @click="reset"
        >
          {{ t('settings.reset') }}
        </button>
      </div>
    </section>

    <section
      v-if="debugEnabled"
      class="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <div class="font-semibold">Debug</div>
      <div class="mt-2 grid gap-1 text-slate-700 dark:text-slate-200">
        <div><span class="text-slate-500 dark:text-slate-400">settings.locale:</span> {{ settings.locale }}</div>
        <div><span class="text-slate-500 dark:text-slate-400">settings.theme:</span> {{ settings.theme }}</div>
        <div><span class="text-slate-500 dark:text-slate-400">supabaseConfigured:</span> {{ String(supabaseConfigured) }}</div>
        <div class="mt-2 text-slate-500 dark:text-slate-400">runtimeConfig.public.supabaseUrl:</div>
        <div class="break-all">{{ supabaseUrlDebug }}</div>
        <div class="mt-2 text-slate-500 dark:text-slate-400">runtimeConfig.public.supabaseAnonKey length:</div>
        <div>{{ supabaseAnonKeyLen }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useChallengeStore } from '~/stores/challenge'
import { useSyncStore } from '~/stores/sync'
import type { AppSettings } from '~/types/challenge'
import { useI18n } from '~/composables/useI18n'

const settings = useSettingsStore()
const challenge = useChallengeStore()
const sync = useSyncStore()
const { t } = useI18n()
const route = useRoute()

const debugEnabled = computed(() => import.meta.dev && route.query.debug === '1')
const runtimePublic = computed(() => useRuntimeConfig().public)
const supabaseConfigured = computed(() => {
  const pub = runtimePublic.value as any
  return Boolean(String(pub?.supabaseUrl || '').trim() && String(pub?.supabaseAnonKey || '').trim())
})
const supabaseUrlDebug = computed(() => String((runtimePublic.value as any)?.supabaseUrl || ''))
const supabaseAnonKeyLen = computed(() => String((runtimePublic.value as any)?.supabaseAnonKey || '').length)

// Theme toggles DOM classes — client-only (SSR has no `document`).
watchEffect(() => {
  if (import.meta.server) return
  const themeMode = settings.theme
  const root = document.documentElement
  if (themeMode === 'system')
    root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
  else root.classList.toggle('dark', themeMode === 'dark')
})

async function push() {
  await sync.pushToCloud()
}
async function pull() {
  await sync.pullFromCloud()
  // Pinia stores are now re-hydrated automatically by sync.pullFromCloud(),
  // no page reload required.
}
function reset() {
  if (!confirm(t('settings.resetConfirm'))) return
  challenge.resetAll()
}

function onThemeChange(e: Event) {
  const el = e.target as HTMLSelectElement | null
  if (!el) return
  settings.setTheme(el.value as any)
}

function onLocaleChange(e: Event) {
  const el = e.target as HTMLSelectElement | null
  if (!el) return
  settings.setLocale(el.value as any)
}
</script>

