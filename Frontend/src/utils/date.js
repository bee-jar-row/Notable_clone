const TIME_FORMAT = { hour: '2-digit', minute: '2-digit' }
const DATE_GROUP_FORMAT = { day: '2-digit', month: 'short', year: 'numeric' }
const SHORT_DATE_FORMAT = { day: '2-digit', month: '2-digit', year: '2-digit' }

export function formatTime(value, fallback = 'All day') {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleTimeString([], TIME_FORMAT)
}

export function formatDateGroup(value, fallback = 'No Date') {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleDateString('en-GB', DATE_GROUP_FORMAT)
}

export function formatShortDate(value, fallback = '-') {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleDateString('en-GB', SHORT_DATE_FORMAT)
}
