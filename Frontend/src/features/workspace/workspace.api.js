import { apiRequest } from '../../shared/api/api'

export function getFolders() {
  return apiRequest('/folders')
}

export function createFolder(payload) {
  return apiRequest('/folders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getFolderNotebooks(folderId) {
  return apiRequest(`/folders/${folderId}/notebooks`)
}

export function getNotebooks() {
  return apiRequest('/notebooks')
}

export function createNotebook(payload) {
  return apiRequest('/notebooks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteNotebook(notebookId) {
  return apiRequest(`/notebooks/${notebookId}`, { method: 'DELETE' })
}

export function getTodos(query = '') {
  return apiRequest(`/todos${query}`)
}

export function createTodo(payload) {
  return apiRequest('/todos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function completeTodo(todoId) {
  return apiRequest(`/todos/${todoId}/complete`, { method: 'PATCH' })
}

export function deleteTodo(todoId) {
  return apiRequest(`/todos/${todoId}`, { method: 'DELETE' })
}
