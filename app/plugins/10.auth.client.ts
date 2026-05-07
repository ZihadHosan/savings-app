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

  async function setupRealtime(userId: string) {
    if (subscribedForUserId === userId) return
    // Await teardown so we don't accumulate ghost subscriptions when the user
    // id changes (rare in practice, but happens during account-switch tests).
    await teardownRealtime()
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
  // We rely on Supabase's INITIAL_SESSION event (fired exactly once after
  // _initialize, with the session recovered from localStorage) instead of an
  // explicit getSession() IIFE. That avoids two parallel setSession calls
  // during page load (the old IIFE + the INITIAL_SESSION event handler both
  // ran the same SELECT, doubling the profile-fetch cost).
  //
  // Keep store in sync with Supabase session changes.
  //
  // ⚠️  MUST be a plain (non-async) callback — do NOT await Supabase REST or
  // auth calls directly here.
  //
  // Why: onAuthStateChange fires while auth-js holds an internal Web Lock
  // (navigator.locks). Any call that flows through fetchWithAuth →
  // getAccessToken() → supabase.auth.getSession() re-enters _acquireLock().
  // With lockAcquired=true the re-entrant path queues the request in
  // pendingInLock *after* the current lock holder finishes — but the lock
  // holder is waiting for _notifyAllSubscribers → our callback → getSession()
  // → pendingInLock → lock holder. Circular deadlock; broken only by timeout.
  //
  // Fix: return void from the callback so _notifyAllSubscribers resolves
  // immediately and the Web Lock is released. Schedule all DB work in a
  // setTimeout(0) macrotask where the lock is guaranteed to be free.
  supabase.auth.onAuthStateChange((event, session) => {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.info('[auth.plugin] onAuthStateChange', {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      })
    }

    // Run all Supabase work after the auth lock is released (next macrotask).
    setTimeout(async () => {
      await auth.setSession(session)

      // Pull-from-cloud only on actual sign-in events and the initial page
      // hydration. We deliberately do NOT run autoSyncOnLogin on
      // TOKEN_REFRESHED — that fires hourly and would re-pull the entire
      // user state from Supabase on every token refresh for no benefit.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && auth.isAuthenticated) {
        try {
          await sync.autoSyncOnLogin()
        } catch {
          // ignore
        }
      }

      // Realtime subscription should follow the *current* user across
      // SIGNED_IN, TOKEN_REFRESHED, and INITIAL_SESSION; setupRealtime
      // is a no-op when subscribedForUserId already matches.
      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') &&
        auth.user?.id
      ) {
        await setupRealtime(auth.user.id)
      }

      if (event === 'SIGNED_OUT' || !session) {
        await teardownRealtime()
      }
    }, 0)
  })
})
