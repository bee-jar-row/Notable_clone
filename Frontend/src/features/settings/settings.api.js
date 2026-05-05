import { apiRequest } from '../../shared/api/api'

export function getProfile() {
  return apiRequest('/user/profile')
}

export function updateProfile(payload) {
  return apiRequest('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function changePassword(payload) {
  return apiRequest('/user/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
