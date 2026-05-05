function calculateBhpsScore(todo) {
  const deadline = todo.deadline ? new Date(todo.deadline) : null
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = deadline && !Number.isNaN(deadline.getTime())
    ? Math.max(0, (deadline.getTime() - now.getTime()) / msPerDay)
    : 30
  const urgency = daysLeft === 0 ? 100 : Math.min(100, 100 / daysLeft)
  const weightScore = (Number(todo.academic_weight) || 1) * 10
  const effortScore = (Number(todo.estimated_effort) || 1) * 10

  return Math.round(((urgency * 0.5) + (weightScore * 0.3) + (effortScore * 0.2)) * 100) / 100
}

export function getBhpsScore(todo) {
  const score = Number(todo?.bhps_score)
  if (!Number.isNaN(score) && score > 0) return score
  return calculateBhpsScore(todo || {})
}

export function getPriorityMeta(todo) {
  const rawLabel = String(todo?.priority_label || '').toLowerCase()
  const score = getBhpsScore(todo)

  if (rawLabel === 'high' || score >= 70) {
    return { label: 'High', tone: 'high' }
  }

  if (rawLabel === 'medium' || score >= 40) {
    return { label: 'Medium', tone: 'medium' }
  }

  return { label: 'Low', tone: 'low' }
}

export function getLoadMeta(todo) {
  const effort = Number(todo?.estimated_effort) || 1

  if (effort >= 7) {
    return { label: 'Heavy', tone: 'heavy' }
  }

  if (effort >= 4) {
    return { label: 'Moderate', tone: 'moderate' }
  }

  return { label: 'Light', tone: 'light' }
}

export function formatBhpsScore(todo) {
  const score = getBhpsScore(todo)
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

export function getFocusCue(todo) {
  const priority = getPriorityMeta(todo)
  const load = getLoadMeta(todo)

  if (priority.tone === 'high' && load.tone === 'heavy') {
    return 'Heavy focus block'
  }

  return `${load.label} focus block`
}
