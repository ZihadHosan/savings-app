import { useAuthStore } from '~/stores/auth'
import { useSyncStore } from '~/stores/sync'

export default defineNuxtPlugin(() => {
  const supabase = useNuxtApp().$supabase
  const auth = useAuthStore()
  const sync = useSyncStore()

  if (!supabase) return

  function clearStoredAuthTokens() {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('sb-') && k.endsWith('-auth-token')) localStorage.removeItem(k)
      }
    } catch {
      // ignore
    }
  }

  function manualLogoutSet() {
    try {
      return localStorage.getItem('auth_manual_logout') === '1'
    } catch {
      return false
    }
  }

  function getStoredSessionTokens(): { access_token: string; refresh_token: string } | null {
    try {
      const key = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
      if (!key) return null
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const access_token = String(parsed?.access_token || '')
      const refresh_token = String(parsed?.refresh_token || '')
      if (!access_token || !refresh_token) return null
      return { access_token, refresh_token }
    } catch {
      return null
    }
  }

  function hasStoredAuthToken() {
    try {
      return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
    } catch {
      return false
    }
  }

  // Initial session (persists across reloads).
  ;(async () => {
    // If the user explicitly logged out, don't rehydrate from storage.
    if (manualLogoutSet()) {
      clearStoredAuthTokens()
      try {
        // Best-effort: ensure auth-js clears any in-memory session.
        await supabase.auth.signOut({ scope: 'local' })
      } catch {
        // ignore
      }
      await auth.setSession(null)
      return
    }

    const first = await supabase.auth.getSession()
    if (first.data.session) {
      await auth.setSession(first.data.session)
      return
    }

    const hasToken = hasStoredAuthToken()
    await new Promise((r) => setTimeout(r, hasToken ? 250 : 50))
    const second = await supabase.auth.getSession()
    if (second.data.session) {
      await auth.setSession(second.data.session)
      return
    }

    try {
      const stored = getStoredSessionTokens()
      if (stored) {
        const set = await supabase.auth.setSession(stored)
        if (set.data.session) {
          await auth.setSession(set.data.session)
          return
        }
      }

      const refreshed = await supabase.auth.refreshSession()
      if (refreshed.data.session) {
        await auth.setSession(refreshed.data.session)
        return
      }
    } catch {
      // fall through to null-session below
    }

    // All recovery attempts failed — ensure the store is settled so middleware
    // and the rest of the app don't spin in 'loading' forever.
    await auth.setSession(null)
  })()

  // Keep store in sync with Supabase session changes.
  supabase.auth.onAuthStateChange(async (event, session) => {
    // If user manually logged out, ignore any auth events until they sign in again.
    if (manualLogoutSet() && event !== 'SIGNED_IN') return
    if (event === 'INITIAL_SESSION' && !session && hasStoredAuthToken()) return
    await auth.setSession(session)

    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && auth.isAuthenticated) {
      await sync.autoSyncOnLogin()
    }
  })
})

