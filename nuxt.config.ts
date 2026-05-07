// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'app',
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],

  experimental: {
    // Avoids dev-mode module resolution issues around `#app-manifest` on some Windows setups.
    appManifest: false
  },

  app: {
    head: {
      title: 'Savings Challenge',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A customizable 52-week savings challenge tracker.' }
      ]
    }
  },

  // Empty defaults; Nuxt merges `.env` keys `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY`
  // into `public.supabaseUrl` / `public.supabaseAnonKey` automatically (no manual process.env needed).
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  pwa: {
    // In dev, service workers can aggressively cache old bundles and make it look like
    // UI interactions / env config "don't work". Disable SW in dev for reliability.
    devOptions: {
      enabled: false
    },
    registerType: 'autoUpdate',
    manifest: {
      name: 'Savings Challenge',
      short_name: 'Savings',
      description: 'Offline-first savings challenge tracker.',
      theme_color: '#0ea5e9',
      background_color: '#0b1220',
      display: 'standalone',
      lang: 'en',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
    },
    client: {
      installPrompt: true
    }
  }
})
