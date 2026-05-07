import type { AppSettings } from '~/types/challenge'

export const LOCALE_DEFAULT_CURRENCY: Record<AppSettings['locale'], string> = {
  en: 'USD',
  bn: 'BDT',
  is: 'ISK'
}

export function defaultCurrencyForLocale(locale: AppSettings['locale']): string {
  return LOCALE_DEFAULT_CURRENCY[locale] ?? 'USD'
}
