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

      // If we successfully hydrated a session, clear any manual-logout marker.
      if (!import.meta.server && this.user) {
        try {
          localStorage.removeItem('auth_manual_logout')
        } catch {
          // ignore
        }
      }

      if (!this.user) {
        this.profile = null
        this.status = 'anonymous'
        this.hydrated = true
        return
      }

      const supabase = useNuxtApp().$supabase
      if (!supabase) {
        this.profile = null
        this.status = 'authenticated'
        this.hydrated = true
        return
      }

      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id,name,username,birthday,gender,phone,address')
          .eq('id', this.user.id)
          .maybeSingle()
        this.profile = (profileRow as any) || null
      } catch {
        this.profile = null
      }

      this.status = 'authenticated'
      this.hydrated = true
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

      // Optimistic, synchronous logout: clear UI state and local tokens FIRST
      // so the app reacts instantly. The remote sign-out runs in the background.
      this.user = null
      this.profile = null
      this.status = 'anonymous'
      this.hydrated = true

      if (!import.meta.server) {
        try {
          localStorage.setItem('auth_manual_logout', '1')
        } catch {
          // ignore
        }
        try {
          for (const k of Object.keys(localStorage)) {
            if (k.startsWith('sb-') && k.endsWith('-auth-token')) localStorage.removeItem(k)
          }
        } catch {
          // ignore
        }
      }

      if (!supabase) return

      // Fire-and-forget remote sign-out. We don't await to keep the UI snappy;
      // any failure is fine because local tokens are already cleared.
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

