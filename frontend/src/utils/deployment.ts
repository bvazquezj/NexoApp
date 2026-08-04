import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Returns a localized relative time string, e.g. "hace 5 minutos".
 * Returns "—" for null/undefined input.
 */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es })
  } catch {
    return '—'
  }
}

/**
 * Builds the absolute webhook URL given an opaque hook token.
 * Heuristic: if the frontend dev server runs on port 5173, replace with backend port 8080.
 * In production this resolves to the same origin (no port swap needed).
 */
export function buildWebhookUrl(hookToken: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const adjusted = origin.replace(':5173', ':8080')
  return `${adjusted}/api/webhooks/deployments/${hookToken}`
}

/** Copy a string to the user's clipboard, swallowing errors. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
