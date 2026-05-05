import { apiRequest, downloadResource } from '../../shared/api/api'

export function globalSearch(query) {
  const params = new URLSearchParams({ q: query })
  return apiRequest(`/search?${params.toString()}`)
}

export function downloadSearchResource(resourceId, filename) {
  return downloadResource(resourceId, filename)
}
