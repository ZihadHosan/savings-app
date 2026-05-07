import { useAuthStore } from '~/stores/auth'
import { useSyncStore } from '~/stores/sync'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const supabase = useNuxtApp().$supabase
  const auth = useAuthStore()
  const sync = useSyncStore()

  if (!supabase) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.warn('[auth.plugin] $supabase is null — env vars missing?')
    }
    // We still need to settle auth so middleware/UI doesn't spin.
    auth.setSession(null)
    return
  }

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
          sync.suppressAutoPush(3000)
          try {
            await sync.pullFromCloud()
          } catch {
            // store captures error
          }
        }
      )
      .subscribe()

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

  // ---- Initial hydration --------------------------------------------------
  //
  // Supabase auth-js loads the session from localStorage on its first
  // getSession() call. We just call it and pass the result through.
  // No manual-logout flag, no token surgery — those caused auto-logout on
  // refresh because the flag wasn't reliably cleared after a fresh login.
  ;(async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.info('[auth.plugin] initial getSession', {
          hasSession: !!data?.session,
          userId: data?.session?.user?.id,
          email: data?.session?.user?.email,
          error: error?.message
        })
      }
      await auth.setSession(data?.session ?? null)
    } catch (e: any) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.warn('[auth.plugin] initial getSession threw', e)
      }
      await auth.setSession(null)
    }
  })()

  // Keep store in sync with Supabase session changes.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.info('[auth.plugin] onAuthStateChange', {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      })
    }

    await auth.setSession(session)

    if (
      (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') &&
      auth.isAuthenticated
    ) {
      try {
        await sync.autoSyncOnLogin()
      } catch {
        // ignore
      }
      if (auth.user?.id) setupRealtime(auth.user.id)
    }

    if (event === 'SIGNED_OUT' || !session) {
      await teardownRealtime()
    }
  })
})
