<template>
  <div class="mx-auto max-w-xl space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.title') }}</h1>
      <p class="text-slate-600 dark:text-slate-300">{{ t('auth.subtitle') }}</p>
    </header>

    <div v-if="!supabase" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      {{ t('auth.needSupabase') }}
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            :class="mode === 'signin' ? 'bg-sky-500 text-white' : 'border border-slate-200 dark:border-slate-800'"
            @click="mode = 'signin'"
          >
            {{ t('auth.modeSignIn') }}
          </button>
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            :class="mode === 'signup' ? 'bg-sky-500 text-white' : 'border border-slate-200 dark:border-slate-800'"
            @click="mode = 'signup'"
          >
            {{ t('auth.modeSignUp') }}
          </button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          <template v-if="mode === 'signin'">
            {{ t('auth.noAccount') }}
            <button type="button" class="font-semibold text-sky-600 hover:underline dark:text-sky-400" @click="mode = 'signup'">
              {{ t('auth.createAccount') }}
            </button>
          </template>
          <template v-else>
            {{ t('auth.haveAccount') }}
            <button type="button" class="font-semibold text-sky-600 hover:underline dark:text-sky-400" @click="mode = 'signin'">
              {{ t('auth.signIn') }}
            </button>
          </template>
        </p>
      </div>

      <form class="mt-4 space-y-4" @submit.prevent="submit">
        <label class="grid gap-1">
          <span class="text-sm font-medium">{{ t('auth.emailLabel') }}</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            placeholder="name@example.com"
          />
        </label>

        <label v-if="step === 'verify'" class="grid gap-1">
          <span class="text-sm font-medium">{{ t('auth.otpCodeLabel') }}</span>
          <input
            v-model.trim="otp"
            inputmode="numeric"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
            placeholder="Paste code from email"
          />
        </label>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            class="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50"
            :disabled="submitDisabled"
          >
            {{ submitLabel }}
          </button>

          <p v-if="notice" class="text-sm text-emerald-700 dark:text-emerald-300" role="status">{{ notice }}</p>
          <p v-if="error" class="text-sm text-rose-600 dark:text-rose-400" role="alert">{{ error }}</p>
        </div>
      </form>
    </section>
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

const mode = ref<'signin' | 'signup'>('signin')
const step = ref<'request' | 'verify'>('request')
const email = ref('')
const otp = ref('')

const loading = ref(false)
const notice = ref('')
const error = ref('')

watchEffect(() => {
  if (auth.isAuthenticated) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    navigateTo(redirect)
  }
})

const submitDisabled = computed(() => {
  if (loading.value || !supabase.value) return true
  if (!email.value) return true
  if (step.value === 'verify') return !otp.value.trim()
  return false
})

const submitLabel = computed(() => {
  if (step.value === 'verify') return t('auth.verifyOtp')
  return mode.value === 'signup' ? t('auth.signUp') : t('auth.signIn')
})

async function submit() {
  error.value = ''
  notice.value = ''
  if (!supabase.value) return

  loading.value = true
  try {
    if (step.value === 'request') {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      const { error: e } = await supabase.value.auth.signInWithOtp({
        email: email.value,
        options: {
          // Sign-in: don't create users. Sign-up: allow creating users.
          shouldCreateUser: mode.value === 'signup',
          // If user clicks the email link instead of typing OTP, handle it here.
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
        }
      })
      if (e) throw e
      step.value = 'verify'
      notice.value = mode.value === 'signup' ? t('auth.sentOtp') : t('auth.sentOtp')
      return
    }

    const { error: e } = await supabase.value.auth.verifyOtp({
      email: email.value,
      token: otp.value,
      type: 'email'
    })
    if (e) throw e
    // onAuthStateChange fires SIGNED_IN synchronously and calls auth.setSession();
    // calling auth.refresh() here as well creates a race between two concurrent setSession calls.
  } catch (e: any) {
    const msg = String(e?.message || '')
    error.value = msg || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

