// Platform-neutral finance formatters.
export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function formatAmount(amount: string, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount))
}

export function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD — parse manually to avoid UTC offset issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function daysUntil(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  const target = new Date(year, month - 1, day).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

export function frequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'MONTHLY': return 'Mensual'
    case 'YEARLY': return 'Anual'
    case 'WEEKLY': return 'Semanal'
    default: return frequency
  }
}
