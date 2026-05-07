/**
 * Money math uses bigint cents to avoid floating point errors.
 * UI can format cents for display only.
 */

export function assertNonNegativeCents(value: bigint, label: string) {
  if (value < 0n) throw new Error(`${label} must be >= 0`)
}

export function parseAmountToCents(input: string): bigint {
  // Accepts "123", "123.4", "123.45". Rejects negatives here; handle separately if needed.
  const s = input.trim().replace(/,/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(s)) throw new Error('Invalid amount')
  const [whole, frac = ''] = s.split('.')
  const frac2 = (frac + '00').slice(0, 2)
  return BigInt(whole || '0') * 100n + BigInt(frac2 || '0')
}

function normalizeIntlLocale(locale?: string): string | undefined {
  const l = String(locale || '').trim()
  if (!l) return undefined
  // Ensure Bangla uses Bengali digits by default.
  if (l === 'bn') return 'bn-BD-u-nu-beng'
  if (l === 'en') return 'en-US'
  if (l === 'is') return 'is-IS'
  return l
}

function toBengaliDigits(input: string): string {
  // Some environments ignore Intl numberingSystem for bn. Force a safe digit transform.
  const map: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  }
  return input.replace(/[0-9]/g, (d) => map[d] || d)
}

export function formatCents(cents: bigint, currency: string, locale?: string): string {
  const negative = cents < 0n
  const abs = negative ? -cents : cents
  const whole = Number(abs / 100n)
  const frac = Number(abs % 100n)
  const value = whole + frac / 100
  const code = String(currency || 'USD').trim().toUpperCase()
  const intlLocale = normalizeIntlLocale(locale)
  const numberingSystem = locale === 'bn' ? 'beng' : undefined

  try {
    const formatted = new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      numberingSystem,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value)
    const out = negative ? `-${formatted}` : formatted
    return locale === 'bn' ? toBengaliDigits(out) : out
  } catch {
    // Fallback for unknown/invalid currency codes (or environments lacking support).
    const symbol =
      {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        BDT: '৳'
      }[code] || code
    const n = new Intl.NumberFormat(intlLocale, {
      numberingSystem,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value)
    const formatted = symbol.length <= 3 ? `${symbol}${n}` : `${symbol} ${n}`
    const out = negative ? `-${formatted}` : formatted
    return locale === 'bn' ? toBengaliDigits(out) : out
  }
}

export function currencySymbol(code: string): string {
  const c = String(code || '').trim().toUpperCase()
  return (
    {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      BDT: '৳',
      ISK: 'kr',
      JPY: '¥',
      CNY: '¥'
    }[c] || c
  )
}

