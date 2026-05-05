import { apiRequest, downloadResource } from '../../shared/api/api'

export function getFocusSessions() {
  return apiRequest('/focus-sessions')
}

export function getFocusRecommendations() {
  return apiRequest('/focus-sessions/recommended')
}

export function startFocusSession(payload) {
  return apiRequest('/focus-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateFocusSession(sessionId, payload) {
  return apiRequest(`/focus-sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function endFocusSession(sessionId) {
  return apiRequest(`/focus-sessions/${sessionId}/end`, { method: 'PATCH' })
}

export function completeFocusTodo(todoId) {
  return apiRequest(`/todos/${todoId}/complete`, { method: 'PATCH' })
}

export function getFocusNotes() {
  return apiRequest('/notes')
}

export function getFocusResources() {
  return apiRequest('/resources')
}

export function downloadFocusResource(resourceId, filename) {
  return downloadResource(resourceId, filename)
}

export function getFocusTodoCandidates() {
  return apiRequest('/todos?limit=100')
}
