import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { messages, type Locale, type MessageKey } from '~/i18n/messages'

export function useI18n() {
  const settings = useSettingsStore()
  const locale = computed<Locale>(() => {
    const l = settings.locale
    return l === 'bn' || l === 'is' ? l : 'en'
  })

  function t(key: MessageKey, vars?: Record<string, string | number>) {
    const msg = messages[locale.value]?.[key] ?? messages.en[key] ?? key
    if (!vars) return msg
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), msg)
  }

  return { locale, t }
}

