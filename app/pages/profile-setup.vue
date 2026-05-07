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
            {{ t('profile.save') }}
          </button>

          <p v-if="!canSave && !error" class="text-xs text-slate-500 dark:text-slate-400">
            {{ t('profile.nameRequired') }}
          </p>
          <p v-if="error" class="text-sm text-rose-600 dark:text-rose-400" role="alert">{{ error }}</p>
          <p v-if="notice" class="text-sm text-emerald-700 dark:text-emerald-300" role="status">{{ notice }}</p>
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
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const supabase = computed(() => useNuxtApp().$supabase)

const name = ref(auth.profile?.name || '')
const username = ref(auth.profile?.username || '')
const birthday = ref(auth.profile?.birthday || '')
const gender = ref(auth.profile?.gender || '')
const phone = ref(auth.profile?.phone || '')
const address = ref(auth.profile?.address || '')
const loading = ref(false)
const error = ref('')
const notice = ref('')

const canSave = computed(() => !!name.value.trim())

// Sync form fields whenever the profile loads/updates (auth hydration can arrive after mount).
let profileSynced = false
watchEffect(() => {
  if (!auth.profile || profileSynced) return
  profileSynced = true
  name.value = auth.profile.name || ''
  username.value = auth.profile.username || ''
  birthday.value = auth.profile.birthday || ''
  gender.value = auth.profile.gender || ''
  phone.value = auth.profile.phone || ''
  address.value = auth.profile.address || ''
})

watchEffect(() => {
  // Only auto-redirect if we were forced here by middleware (redirect query present).
  if (!auth.isAuthenticated) return
  if (auth.needsProfileSetup) return
  if (typeof route.query.redirect !== 'string' || !route.query.redirect) return
  navigateTo(route.query.redirect)
})

async function save() {
  error.value = ''
  notice.value = ''
  if (!supabase.value) return
  if (!auth.user) return
  if (!name.value.trim()) return

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

    if (!row) {
      throw new Error(
        'Profile row could not be read after save. Check the SELECT RLS policy on public.profiles.'
      )
    }
    if ((row as any).name !== payload.name) {
      throw new Error(
        'Profile saved silently failed (name not persisted). This is almost certainly a missing RLS UPDATE policy on public.profiles. Run the SQL in the Supabase dashboard: ' +
          'create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);'
      )
    }

    // Update the in-memory profile so the header/forms reflect it instantly.
    auth.profile = row as any

    // Re-pull the full session/profile so everything downstream is consistent.
    await auth.refresh()

    notice.value = t('profile.saved')
  } catch (e: any) {
    error.value = e?.message || 'Profile save failed'
  } finally {
    loading.value = false
  }
}
</script>

