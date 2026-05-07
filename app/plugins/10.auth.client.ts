import { useAuthStore } from '~/stores/auth'
import { useSyncStore } from '~/stores/sync'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const supabase = useNuxtApp().$supabase
  const auth = useAuthStore()
  const sync = useSyncStore()

  if (!supabase) return

  // Realtime subscription handles for the current user. Recreated on user
  // change; cleaned up on sign-out.
  let stateChannel: RealtimeChannel | null = null
  let profileChannel: RealtimeChannel | null = null
  let subscribedForUserId: string | null = null

  async function teardownRealtime() {
    try {
      if (stateChannel) await supabase!.removeChannel(stateChannel)
    } catch {
      // ignore
    }
    try {
      if (profileChannel) await supabase!.removeChannel(profileChannel)
    } catch {
      // ignore
    }
    stateChannel = null
    profileChannel = null
    subscribedForUserId = null
  }

  function setupRealtime(userId: string) {
    if (subscribedForUserId === userId) return
    teardownRealtime()
    subscribedForUserId = userId

    // Cross-device dashboard sync: listen for user_states changes belonging to
    // this user, then pull + re-hydrate the Pinia stores.
    stateChannel = supabase!
      .channel(`user_states:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_states',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Don't push back what we're about to pull.
          sync.suppressAutoPush(3000)
          try {
            await sync.pullFromCloud()
          } catch {
            // store captures error
          }
        }
      )
      .subscribe()

    // Live profile updates (e.g. name change on another device).
    profileChannel = supabase!
      .channel(`profiles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        async () => {
          try {
            await auth.refresh()
          } catch {
            // ignore
          }
        }
      )
      .subscribe()
  }

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
      if (auth.user?.id) setupRealtime(auth.user.id)
    }

    if (event === 'SIGNED_OUT' || !session) {
      await teardownRealtime()
    }
  })
})

