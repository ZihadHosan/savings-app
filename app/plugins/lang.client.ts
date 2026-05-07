import { watchEffect } from 'vue'
import { useSettingsStore } from '~/stores/settings'

export default defineNuxtPlugin(() => {
  const settings = useSettingsStore()
  watchEffect(() => {
    document.documentElement.lang = settings.locale
  })
})

