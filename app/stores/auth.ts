import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'

export type UserProfile = {
  id: string
  name: string | null
  username: string | null
  birthday: string | null
  gender: string | null
  phone: string | null
  address: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    hydrated: false as boolean,
    status: 'idle' as 'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error',
    lastError: '' as string
  }),

  getters: {
    isAuthenticated: (s) => !!s.user,
    needsProfileSetup: (s) => !!s.user && (!s.profile || !s.profile.name)
  },

  actions: {
    async setSession(session: Session | null) {
      this.status = 'loading'
      this.user = session?.user ?? null
      this.lastError = ''

      if (!this.user) {
        this.profile = null
        this.status = 'anonymous'
        this.hydrated = true
        return
      }

      // We know the user — settle auth state IMMEDIATELY so the UI / router
      // middleware / profile-guard plugin stop waiting. The profile fetch
      // runs after, and updates `profile` when it resolves; `needsProfileSetup`
      // re-evaluates reactively.
      this.status = 'authenticated'
      this.hydrated = true

      const supabase = useNuxtApp().$supabase
      if (!supabase) {
        this.profile = null
        return
      }

      // Bound the profile fetch — if Supabase ever hangs (network, RLS misconfig,
      // realtime stalling) we don't want auth to be stuck in `loading` forever.
      // 15s is generous enough for slow connections without freezing the UI.
      const PROFILE_FETCH_TIMEOUT_MS = 15000
      const userId = this.user.id

      try {
        const fetchProfile = supabase
          .from('profiles')
          .select('id,name,username,birthday,gender,phone,address')
          .eq('id', userId)
          .maybeSingle()

        const result = (await Promise.race([
          fetchProfile,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('profile fetch timed out')),
              PROFILE_FETCH_TIMEOUT_MS
            )
          )
        ])) as { data: any; error: any }

        const { data: profileRow, error: profileError } = result

        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.info('[auth.setSession] profile fetch', {
            userId,
            email: this.user?.email,
            profileError: profileError?.message,
            profileRow
          })
        }

        if (profileError) {
          this.profile = null
          this.lastError = profileError.message
        } else {
          this.profile = (profileRow as any) || null
        }
      } catch (e: any) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.warn('[auth.setSession] profile fetch failed', e?.message || e)
        }
        this.profile = null
        this.lastError = e?.message || 'Profile fetch failed'
      }
    },

    async refresh() {
      const supabase = useNuxtApp().$supabase
      if (!supabase) {
        this.user = null
        this.profile = null
        this.status = 'anonymous'
        this.hydrated = true
        return
      }

      this.status = 'loading'
      this.lastError = ''
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        await this.setSession(sessionData.session)
      } catch (e: any) {
        this.user = null
        this.profile = null
        this.hydrated = true
        this.status = 'error'
        this.lastError = e?.message || 'Auth failed'
      }
    },

    async signOut() {
      const supabase = useNuxtApp().$supabase
      this.lastError = ''

      // Optimistic, synchronous logout: clear UI state first so the header
      // reacts instantly without a refresh.
      this.user = null
      this.profile = null
      this.status = 'anonymous'
      this.hydrated = true

      if (!supabase) return

      // Fire-and-forget remote sign-out. We let supabase auth-js manage its
      // own localStorage tokens — no manual surgery, which caused auto-logout
      // on refresh because the manual_logout flag wasn't reliably cleared
      // after a fresh login.
      void (async () => {
        try {
          await supabase.auth.signOut({ scope: 'global' })
        } catch {
          try {
            await supabase.auth.signOut({ scope: 'local' })
          } catch {
            // ignore
          }
        }
      })()
    }
  }
})

