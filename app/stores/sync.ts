import { defineStore } from 'pinia'
import type { PersistedStateV1 } from '~/types/challenge'
import { loadPersistedState, savePersistedState } from '~/utils/storage'
import { useChallengeStore } from '~/stores/challenge'
import { useSettingsStore } from '~/stores/settings'

/**
 * Re-hydrate Pinia stores from whatever is currently in localStorage.
 * Call this after pulling fresh state from the cloud so the running app
 * (dashboard, etc.) updates immediately without a page reload.
 */
function rehydrateStoresFromLocalStorage() {
  if (import.meta.server) return
  const persisted = loadPersistedState()
  if (!persisted) return
  try {
    useSettingsStore().initFromPersisted(persisted)
    useChallengeStore().initFromPersisted(persisted)
  } catch {
    // ignore — stores may not be ready in some edge contexts
  }
}

/**
 * Optional cloud sync. If Supabase isn't configured, these actions become no-ops.
 *
 * Supabase schema (recommended):
 * - table: user_states
 *   - user_id (uuid, primary key, references auth.users)
 *   - state_json (jsonb, not null)
 *   - updated_at (timestamptz, default now())
 *
 * RLS:
 * - enable RLS
 * - allow select/insert/update where auth.uid() = user_id
 */
export const useSyncStore = defineStore('sync', {
  state: () => ({
    status: 'idle' as 'idle' | 'syncing' | 'error' | 'disabled',
    lastError: '' as string,
    lastSyncedAtISO: '' as string,
    autoPushSuppressedUntilMs: 0 as number
  }),

  getters: {
    isAutoPushSuppressed: (s) => Date.now() < s.autoPushSuppressedUntilMs
  },

  actions: {
    suppressAutoPush(ms = 2000) {
      this.autoPushSuppressedUntilMs = Date.now() + ms
    },
    async pushToCloud() {
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase
      if (!supabase) {
        this.status = 'disabled'
        return
      }

      this.status = 'syncing'
      this.lastError = ''
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const local = loadPersistedState()
        if (!local) throw new Error('Nothing to sync')

        const { error } = await supabase.from('user_states').upsert(
          {
            user_id: user.id,
            state_json: {
              ...local,
              // Bigint should already be serialized in storage payload.
              challenge: local.challenge
                ? {
                    ...local.challenge,
                    startAmountCents: local.challenge.startAmountCents.toString(),
                    weeklyIncrementCents: local.challenge.weeklyIncrementCents.toString(),
                    goalAmountCents: local.challenge.goalAmountCents?.toString()
                  }
                : undefined
            }
          },
          { onConflict: 'user_id' }
        )
        if (error) throw error
        this.lastSyncedAtISO = new Date().toISOString()
        this.status = 'idle'
      } catch (e: any) {
        this.status = 'error'
        this.lastError = e?.message || 'Sync failed'
      }
    },

    async pullFromCloud() {
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase
      if (!supabase) {
        this.status = 'disabled'
        return
      }

      this.status = 'syncing'
      this.lastError = ''
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('user_states')
          .select('state_json,updated_at')
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) throw error
        if (!data?.state_json) throw new Error('No cloud state found')

        // Avoid immediately pushing the pulled state back up.
        this.suppressAutoPush()

        // Trust storage loader to validate/convert.
        localStorage.setItem('savings_challenge_state', JSON.stringify(data.state_json))
        const refreshed = loadPersistedState()
        if (refreshed) savePersistedState(refreshed)

        // Push the freshly-pulled state into the live Pinia stores so the
        // dashboard reflects it without a page reload.
        rehydrateStoresFromLocalStorage()

        this.lastSyncedAtISO = String(data.updated_at || new Date().toISOString())
        this.status = 'idle'
      } catch (e: any) {
        this.status = 'error'
        this.lastError = e?.message || 'Sync failed'
      }
    }
    ,
    async autoSyncOnLogin() {
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase
      if (!supabase) {
        this.status = 'disabled'
        return
      }

      // If no local state, just try pull.
      const local = loadPersistedState()
      if (!local) {
        await this.pullFromCloud()
        return
      }

      this.status = 'syncing'
      this.lastError = ''
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('user_states')
          .select('state_json,updated_at')
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) throw error

        // If no cloud state exists, push local.
        if (!data?.state_json) {
          this.status = 'idle'
          await this.pushToCloud()
          return
        }

        // Decide winner: newest updated_at wins (cloud) vs local save time (best-effort).
        // Local doesn't track modified time yet, so default to cloud-first on login.
        // Avoid immediately pushing the pulled state back up.
        this.suppressAutoPush()

        localStorage.setItem('savings_challenge_state', JSON.stringify(data.state_json))
        const refreshed = loadPersistedState()
        if (refreshed) savePersistedState(refreshed)

        // Push the freshly-pulled state into the live Pinia stores so the
        // dashboard reflects it without a page reload.
        rehydrateStoresFromLocalStorage()

        this.lastSyncedAtISO = String(data.updated_at || new Date().toISOString())
        this.status = 'idle'
      } catch (e: any) {
        this.status = 'error'
        this.lastError = e?.message || 'Sync failed'
      }
    }
  }
})

