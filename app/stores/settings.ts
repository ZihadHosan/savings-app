import { defineStore } from 'pinia'
import type { AppSettings, PersistedStateV1 } from '~/types/challenge'
import { defaultCurrencyForLocale, LOCALE_DEFAULT_CURRENCY } from '~/utils/locale-currency'
import { useChallengeStore } from '~/stores/challenge'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      locale: 'bn',
      theme: 'system',
      remindersEnabled: false
    } as AppSettings
  }),

  getters: {
    locale: (s) => s.settings.locale,
    theme: (s) => s.settings.theme,
    remindersEnabled: (s) => s.settings.remindersEnabled
  },

  actions: {
    initFromPersisted(persisted: PersistedStateV1) {
      this.settings = persisted.settings
    },
    setLocale(locale: AppSettings['locale']) {
      const previous = this.settings.locale
      this.settings.locale = locale
      if (previous === locale) return

      // Keep the challenge currency in sync with the chosen language. We only
      // overwrite when the previous currency is the well-known default for the
      // previous locale (USD/BDT/ISK), so a user-chosen currency (e.g. EUR) is
      // left alone.
      const challenge = useChallengeStore()
      if (!challenge.challenge) return

      const currentCurrency = challenge.challenge.currency
      const previousDefault = LOCALE_DEFAULT_CURRENCY[previous]
      const isFollowingDefault =
        !!previousDefault && currentCurrency.toUpperCase() === previousDefault

      if (isFollowingDefault) {
        challenge.setCurrency(defaultCurrencyForLocale(locale))
      }
    },
    setTheme(theme: AppSettings['theme']) {
      this.settings.theme = theme
    },
    setRemindersEnabled(enabled: boolean) {
      this.settings.remindersEnabled = enabled
    }
  }
})

