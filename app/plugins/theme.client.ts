import { watchEffect } from 'vue'
import { useSettingsStore } from '~/stores/settings'

export default defineNuxtPlugin(() => {
  const settings = useSettingsStore()

  watchEffect(() => {
    const root = document.documentElement
    const themeMode = settings.theme
    const isDark =
      themeMode === 'system'
        ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        : themeMode === 'dark'

    root.classList.toggle('dark', isDark)
  })
})

