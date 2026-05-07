import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Reactive profile-setup guard.
 *
 * The global middleware in `app/middleware/profile-setup.global.ts` only fires
 * on a navigation event. On a fresh page load, auth hydration may finish AFTER
 * the route has already resolved, so the user lands on `/` with a missing
 * profile and no redirect ever happens.
 *
 * This plugin watches the auth store and, once auth has hydrated and the user
 * is signed in but missing a profile name, navigates to `/profile-setup`.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const router = useRouter()

  // Don't redirect away from these paths even if profile is incomplete.
  const exempt = new Set([
    '/profile-setup',
    '/login',
    '/auth/callback'
  ])

  watch(
    () => ({
      hydrated: auth.hydrated,
      authed: auth.isAuthenticated,
      needsSetup: auth.needsProfileSetup
    }),
    ({ hydrated, authed, needsSetup }) => {
      if (!hydrated) return
      if (!authed) return
      if (!needsSetup) return

      const path = router.currentRoute.value.path
      if (exempt.has(path)) return

      navigateTo({
        path: '/profile-setup',
        query: { redirect: router.currentRoute.value.fullPath || path }
      })
    },
    { immediate: true }
  )
})
