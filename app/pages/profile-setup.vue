<template>
  <div class="mx-auto max-w-xl space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('profile.title') }}</h1>
      <p class="text-slate-600 dark:text-slate-300">{{ t('profile.subtitle') }}</p>
    </header>

    <ClientOnly>
      <div v-if="!supabase" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        {{ t('auth.needSupabase') }}
      </div>

      <div v-else-if="!auth.isAuthenticated" class="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {{ t('profile.mustSignIn') }}
      </div>

      <section v-else class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div
          v-if="notice"
          class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
          role="status"
        >
          {{ notice }}
        </div>
        <div
          v-if="error"
          class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {{ error }}
        </div>
        <form class="space-y-4" @submit.prevent="save">
        <label class="grid gap-1">
          <span class="text-sm font-medium">
            {{ t('profile.nameLabel') }}
            <span class="text-rose-600 dark:text-rose-400" aria-hidden="true">*</span>
          </span>
          <input
            v-model.trim="name"
            required
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            :class="{ 'border-rose-300 focus:border-rose-500 dark:border-rose-700': !name.trim() }"
            :placeholder="t('profile.namePlaceholder')"
          />
          <span v-if="!name.trim()" class="text-xs text-rose-600 dark:text-rose-400">
            {{ t('profile.nameRequired') }}
          </span>
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('profile.birthdayLabel') }}</span>
            <input
              v-model="birthday"
              type="date"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            />
          </label>

          <label class="grid gap-1">
            <span class="text-sm font-medium">{{ t('profile.genderLabel') }}</span>
            <select v-model="gender" class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              <option value="">{{ t('profile.genderUnspecified') }}</option>
              <option value="male">{{ t('profile.genderMale') }}</option>
              <option value="female">{{ t('profile.genderFemale') }}</option>
              <option value="other">{{ t('profile.genderOther') }}</option>
            </select>
          </label>
        </div>

        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('profile.phoneLabel') }}</span>
          <input
            v-model.trim="phone"
            type="tel"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            placeholder="+8801XXXXXXXXX"
          />
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('profile.addressLabel') }}</span>
          <textarea
            v-model.trim="address"
            rows="3"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            :placeholder="t('profile.addressPlaceholder')"
          />
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('profile.usernameLabel') }}</span>
          <input
            v-model.trim="username"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            placeholder="zihad"
          />
        </label>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !canSave"
            :title="!canSave ? t('profile.nameRequired') : ''"
          >
            {{ loading ? 'Saving…' : t('profile.save') }}
          </button>

          <p v-if="!canSave" class="text-xs text-slate-500 dark:text-slate-400">
            {{ t('profile.nameRequired') }}
          </p>
        </div>
        </form>
      </section>
      <template #fallback>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
          Loading…
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const supabase = computed(() => useNuxtApp().$supabase)

const name = ref('')
const username = ref('')
const birthday = ref('')
const gender = ref('')
const phone = ref('')
const address = ref('')
const loading = ref(false)
const error = ref('')
const notice = ref('')

// Suppress the redirect-watcher right after save, so the success notice
// stays visible long enough for the user to read it.
const justSaved = ref(false)

const canSave = computed(() => !!name.value.trim())

// One-shot sync: pre-fill the form from cloud data (auth.profile) the first
// time it becomes available. We re-arm `profileSynced=false` whenever we
// want to re-pull from cloud (mount, post-save) so the form always mirrors
// the server, not a cached local copy.
let profileSynced = false

function syncFormFromCloud() {
  if (!auth.profile) return
  profileSynced = true
  name.value = auth.profile.name || ''
  username.value = auth.profile.username || ''
  birthday.value = auth.profile.birthday || ''
  gender.value = auth.profile.gender || ''
  phone.value = auth.profile.phone || ''
  address.value = auth.profile.address || ''
}

watchEffect(() => {
  if (!auth.profile || profileSynced) return
  syncFormFromCloud()
})

// Always pull the latest cloud profile when this page opens, so the form
// shows the freshest server data — not any stale in-memory copy from a
// previous page visit.
onMounted(async () => {
  if (!auth.user) return
  profileSynced = false
  try {
    await auth.refresh()
  } catch {
    // surfaced via auth.lastError; form stays editable
  }
})

watchEffect(() => {
  // Skip the auto-redirect during/after a save so the success notice is visible.
  if (justSaved.value) return
  if (loading.value) return
  // Only auto-redirect if we were forced here by middleware (redirect query present).
  if (!auth.isAuthenticated) return
  if (auth.needsProfileSetup) return
  if (typeof route.query.redirect !== 'string' || !route.query.redirect) return
  navigateTo(route.query.redirect)
})

async function save() {
  error.value = ''
  notice.value = ''
  if (!supabase.value) {
    error.value = 'Supabase is not configured.'
    return
  }
  if (!auth.user) {
    error.value = 'You must be signed in.'
    return
  }
  if (!name.value.trim()) {
    error.value = t('profile.nameRequired')
    return
  }

  loading.value = true
  try {
    const payload = {
      id: auth.user.id,
      name: name.value.trim(),
      username: username.value.trim() ? username.value.trim() : null,
      birthday: birthday.value || null,
      gender: gender.value || null,
      phone: phone.value.trim() ? phone.value.trim() : null,
      address: address.value.trim() ? address.value.trim() : null
    }

    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.info('[profile-setup] upserting payload', payload)
    }

    // Upsert (insert or update) the profile row.
    const { error: upsertError } = await supabase.value
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
    if (upsertError) throw upsertError

    // Verification read-back. If the row's name doesn't match what we just
    // wrote, the most likely cause is a missing RLS UPDATE policy on the
    // `profiles` table — Supabase silently does 0 rows-affected and returns
    // no error. Detect that and surface a clear, fixable message.
    const { data: row, error: fetchError } = await supabase.value
      .from('profiles')
      .select('id,name,username,birthday,gender,phone,address')
      .eq('id', auth.user.id)
      .maybeSingle()
    if (fetchError) throw fetchError

    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.info('[profile-setup] verified row', row)
    }

    if (!row) {
      throw new Error(
        'Profile row could not be read after save. Check the SELECT RLS policy on public.profiles.'
      )
    }
    if ((row as any).name !== payload.name) {
      throw new Error(
        'Profile save silently failed (name not persisted). This is almost certainly a missing RLS UPDATE policy on public.profiles. Run this SQL in the Supabase SQL editor: ' +
          'create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);'
      )
    }

    // Re-arm the sync flag so the next auth.profile change re-pre-fills the
    // form with whatever the server actually returned (server defaults, etc.).
    profileSynced = false

    // Update the in-memory profile so the header/forms reflect it instantly.
    auth.profile = row as any

    // Re-pull the full session/profile so everything downstream is consistent.
    await auth.refresh()

    // Final form sync from the cloud copy after refresh, in case auth.refresh
    // didn't change the object reference (Vue would skip the watchEffect).
    syncFormFromCloud()

    // Show the confirmation, suppress the auto-redirect watcher, and only
    // navigate after the user has had a moment to read it.
    justSaved.value = true
    notice.value = t('profile.saved')
    loading.value = false

    setTimeout(() => {
      const redirect =
        typeof route.query.redirect === 'string' && route.query.redirect
          ? route.query.redirect
          : '/'
      navigateTo(redirect, { replace: true })
    }, 1500)
    return
  } catch (e: any) {
    error.value = e?.message || 'Profile save failed'
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error('[profile-setup] save failed', e)
    }
  } finally {
    if (!justSaved.value) loading.value = false
  }
}
</script>

