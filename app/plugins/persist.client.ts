import { savePersistedState, loadPersistedState } from '~/utils/storage'
import { useChallengeStore } from '~/stores/challenge'
import { useSettingsStore } from '~/stores/settings'
import { watch } from 'vue'
import type { ChallengeProgress, ChallengeSettings, AppSettings } from '~/types/challenge'
import { useAuthStore } from '~/stores/auth'
import { useSyncStore } from '~/stores/sync'

export default defineNuxtPlugin(() => {
  const persisted = loadPersistedState()
  const challenge = useChallengeStore()
  const settings = useSettingsStore()
  const auth = useAuthStore()
  const sync = useSyncStore()

  if (persisted) {
    settings.initFromPersisted(persisted)
    challenge.initFromPersisted(persisted)
  }

  let pushTimer: ReturnType<typeof setTimeout> | null = null

  // Persist on change (throttled by event loop microtasks; keeps it simple/offline-first).
  watch(
    () => ({
      settings: settings.settings,
      challenge: challenge.challenge,
      progress: challenge.progress
    }),
    (v: { settings: AppSettings; challenge?: ChallengeSettings; progress?: ChallengeProgress }) => {
      savePersistedState({
        version: 1,
        settings: v.settings,
        challenge: v.challenge,
        progress: v.progress
      })

      // Auto-push: if logged in + configured, debounce sync to cloud.
      if (!auth.isAuthenticated) return
      if (sync.isAutoPushSuppressed) return
      if (sync.status === 'disabled') return

      if (pushTimer) clearTimeout(pushTimer)
      pushTimer = setTimeout(async () => {
        try {
          await sync.pushToCloud()
        } catch {
          // store captures error
        }
      }, 1200)
    },
    { deep: true }
  )
})

