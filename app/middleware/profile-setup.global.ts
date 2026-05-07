export default defineNuxtRouteMiddleware((to) => {
  // Client-only: relies on Supabase session + Pinia state.
  if (import.meta.server) return

  const auth = useAuthStore()

  // Don't block until auth+profile have hydrated on client.
  if (!auth.hydrated || auth.status === 'idle' || auth.status === 'loading') return

  // If signed in but profile missing, force profile setup.
  if (auth.isAuthenticated && auth.needsProfileSetup) {
    if (to.path !== '/profile-setup') {
      return navigateTo({
        path: '/profile-setup',
        query: {
          redirect: typeof to.fullPath === 'string' ? to.fullPath : to.path
        }
      })
    }
  }
})

