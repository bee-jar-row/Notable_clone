import { apiBlobRequest, apiRequest } from '../../shared/api/api'

function buildNotebookBody(payload) {
  if (payload.cover_file) {
    const formData = new FormData()
    formData.append('title', payload.title)
    if (payload.folder_id) formData.append('folder_id', payload.folder_id)
    if (payload.cover_type) formData.append('cover_type', payload.cover_type)
    if (payload.cover_color) formData.append('cover_color', payload.cover_color)
    formData.append('cover', payload.cover_file)
    return formData
  }

  return JSON.stringify(payload)
}

function buildNotebookOptions(method, payload) {
  return {
    method,
    body: buildNotebookBody(payload),
  }
}

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
  return apiRequest('/notebooks', buildNotebookOptions('POST', payload))
}

export function updateNotebook(notebookId, payload) {
  return apiRequest(`/notebooks/${notebookId}`, buildNotebookOptions('PATCH', payload))
}

export function getNotebookCover(notebookId) {
  return apiBlobRequest(`/notebooks/${notebookId}/cover`)
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
