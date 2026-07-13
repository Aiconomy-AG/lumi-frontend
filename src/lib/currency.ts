const DEFAULT_CURRENCY = import.meta.env.VITE_CURRENCY ?? 'USD'

export function formatPrice(value: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(value)
}
