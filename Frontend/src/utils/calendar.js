export function normalizeGoogleCalendarEmbedUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    const isGoogleCalendarEmbed = url.protocol === 'https:'
      && url.hostname === 'calendar.google.com'
      && url.pathname === '/calendar/embed'

    return isGoogleCalendarEmbed ? url.toString() : null
  } catch {
    return null
  }
}

export function isGoogleCalendarEmbedUrl(value) {
  return normalizeGoogleCalendarEmbedUrl(value) !== null
}
