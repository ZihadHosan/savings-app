import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = String(config.public.supabaseUrl || '').trim()
  const anon = String(config.public.supabaseAnonKey || '').trim()

  const supabase: SupabaseClient | null =
    url && anon
      ? createClient(url, anon, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // PKCE matches Supabase's modern email-confirmation URLs (`?code=...`).
            // If a user opens the email in a different browser/incognito tab the
            // verifier is missing — the /auth/callback page handles that gracefully
            // by redirecting back to /login with an explanatory message.
            flowType: 'pkce'
          }
        })
      : null

  if (import.meta.dev && !supabase) {
    console.warn(
      '[supabase] Client not created: set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY in .env and restart `npm run dev`.'
    )
  }

  return {
    provide: {
      supabase
    }
  }
})

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient | null
  }
}

