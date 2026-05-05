import { apiRequest } from '../../shared/api/api'

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestPasswordReset(payload) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
