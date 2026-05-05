const DATE_TIME_FORMAT = {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
}

export function getDefaultReminderAt(deadline) {
  if (!deadline) return ''

  const deadlineDate = new Date(deadline)
  if (Number.isNaN(deadlineDate.getTime())) return ''

  const reminderDate = new Date(deadlineDate.getTime() - (24 * 60 * 60 * 1000))
  const now = new Date()
  return toDatetimeLocalValue(reminderDate < now ? now : reminderDate)
}

export function toDatetimeLocalValue(value) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000))
  return offsetDate.toISOString().slice(0, 16)
}

export function toIsoOrNull(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

export function formatReminderDateTime(value, fallback = 'No reminder') {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString('en-GB', DATE_TIME_FORMAT)
}

export function getReminderMeta(todo, now = new Date()) {
  if (!todo || todo.is_completed === 1) {
    return { label: 'No reminder', tone: 'none', rank: 4 }
  }

  const deadline = todo.deadline ? new Date(todo.deadline) : null
  const reminder = todo.reminder_at ? new Date(todo.reminder_at) : null

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < now) {
    return { label: 'Overdue', tone: 'overdue', rank: 0 }
  }

  if (reminder && !Number.isNaN(reminder.getTime()) && reminder <= now) {
    return { label: 'Due soon', tone: 'dueSoon', rank: 1 }
  }

  if (reminder && !Number.isNaN(reminder.getTime())) {
    return { label: `Reminder ${formatReminderDateTime(reminder)}`, tone: 'upcoming', rank: 2 }
  }

  return { label: 'No reminder', tone: 'none', rank: 4 }
}
