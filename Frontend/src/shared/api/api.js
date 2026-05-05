const API_BASE_URL = 'http://localhost:3000/api'
const TOKEN_KEY = 'notable_token'
const USER_KEY = 'notable_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function readMessage(payload, fallback) {
  if (!payload) return fallback
  if (payload.message) return payload.message
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors.map((error) => error.msg).join(', ')
  }
  return fallback
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new Error(readMessage(payload, 'Request failed'))
  }

  return payload
}

export function getResourceDownloadUrl(resourceId) {
  return `${API_BASE_URL}/resources/${resourceId}/download`
}

export async function downloadResource(resourceId, filename) {
  const token = getToken()
  const response = await fetch(getResourceDownloadUrl(resourceId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error('Download failed')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'resource'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
