<template>
  <div class="mx-auto max-w-xl space-y-4 py-10 text-sm text-slate-700 dark:text-slate-200">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div class="font-semibold">{{ title }}</div>
      <p class="mt-1 text-slate-600 dark:text-slate-300">{{ message }}</p>
      <div v-if="hint" class="mt-2 text-slate-600 dark:text-slate-300">{{ hint }}</div>
      <div v-if="errorText" class="mt-3 break-words text-xs text-rose-600 dark:text-rose-400">
        {{ errorText }}
      </div>
      <div class="mt-4">
        <NuxtLink
          v-if="showBack"
          to="/login"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Back to login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const supabase = computed(() => useNuxtApp().$supabase)

const title = ref('Signing you in…')
const message = ref('Please wait.')
const hint = ref('')
const errorText = ref('')
const showBack = ref(false)
let completed = false

function getRedirectTarget() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  return redirect || '/profile-setup'
}

function isVerifierMissingError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase()
  return (
    msg.includes('code verifier') ||
    msg.includes('auth session missing') ||
    (msg.includes('invalid request') && msg.includes('code'))
  )
}

function showVerifierMissing(detail?: string) {
  title.value = 'Sign-in failed'
  message.value = 'This confirmation link must be opened in the same browser tab where you started signing in.'
  hint.value =
    'Tip: go back to the login page in your original tab and paste the 6-digit code from the email instead.'
  if (detail) errorText.value = detail
  showBack.value = true
}

async function navigateAfterLogin() {
  completed = true
  const target = getRedirectTarget()
  try {
    // Strip any one-time code/hash from the URL so Back can't replay it.
    window.history.replaceState({}, document.title, target)
  } catch {
    // ignore
  }
  await navigateTo(target, { replace: true })
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

if (!import.meta.server) {
  ;(async () => {
    try {
      if (!supabase.value) throw new Error('Supabase not configured')

      // Hard fail-safe: don't hang forever (UI fallback only).
      setTimeout(() => {
        if (completed) return
        title.value = 'Sign-in failed'
        message.value = 'Please try again.'
        errorText.value = errorText.value || 'Timed out while completing sign-in.'
        showBack.value = true
      }, 15000)

      // Supabase may return errors in the query string.
      const queryError =
        (typeof route.query.error_description === 'string' ? route.query.error_description : '') ||
        (typeof route.query.error === 'string' ? route.query.error : '')
      if (queryError) {
        title.value = 'Sign-in failed'
        message.value = 'The email link is invalid or expired. Please request a new code.'
        errorText.value = decodeURIComponent(queryError.replace(/\+/g, ' '))
        showBack.value = true
        return
      }

      // Implicit-flow style: session tokens in URL hash. We set the session
      // directly (no race with detectSessionInUrl in this case).
      const hashParams = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''))
      const access_token = hashParams.get('access_token') || ''
      const refresh_token = hashParams.get('refresh_token') || ''
      if (access_token && refresh_token) {
        const { error } = await supabase.value.auth.setSession({ access_token, refresh_token })
        if (error) throw error
      }

      // PKCE flow (?code=...): with `detectSessionInUrl: true`, Supabase auth-js
      // will automatically consume the code and establish the session as the
      // client initializes. Calling exchangeCodeForSession ourselves races the
      // built-in handler and hangs.
      //
      // So instead, just poll getSession() until a session appears (or we time
      // out). Also short-circuit immediately if a session is already there.
      const code = typeof route.query.code === 'string' ? route.query.code : ''
      const deadline = Date.now() + 10_000
      let session: any = null
      while (Date.now() < deadline) {
        const { data } = await supabase.value.auth.getSession()
        if (data?.session) {
          session = data.session
          break
        }
        await delay(200)
      }

      if (session) {
        await auth.setSession(session)
        await navigateAfterLogin()
        return
      }

      // No session after polling. If the URL had a `?code=`, the most likely
      // cause is the link being opened in a different browser/incognito tab
      // where the PKCE code verifier is unavailable.
      if (code) {
        showVerifierMissing()
        return
      }

      title.value = 'Sign-in failed'
      message.value = 'Please request a new code from the login page.'
      errorText.value = 'No active session and no sign-in code found in the URL.'
      showBack.value = true
    } catch (e: any) {
      if (isVerifierMissingError(e)) {
        showVerifierMissing(e?.message || String(e))
        return
      }
      title.value = 'Sign-in failed'
      message.value = 'Please try again.'
      errorText.value = e?.message || String(e)
      showBack.value = true
    }
  })()
}
</script>
