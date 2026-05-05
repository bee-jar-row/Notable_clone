import { apiRequest, downloadResource } from '../../shared/api/api'

export function getNotebooks() {
  return apiRequest('/notebooks')
}

export function getNotebookChapters(notebookId) {
  return apiRequest(`/notebooks/${notebookId}/chapters`)
}

export function createChapter(notebookId, payload) {
  return apiRequest(`/notebooks/${notebookId}/chapters`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateChapter(chapterId, payload) {
  return apiRequest(`/chapters/${chapterId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteChapter(chapterId) {
  return apiRequest(`/chapters/${chapterId}`, { method: 'DELETE' })
}

export function getNotebookResources(notebookId) {
  return apiRequest(`/resources/notebook/${notebookId}`)
}

export function getChapterResources(chapterId) {
  return apiRequest(`/resources/chapter/${chapterId}`)
}

export function uploadResource(formData) {
  return apiRequest('/resources', {
    method: 'POST',
    body: formData,
  })
}

export function deleteResource(resourceId) {
  return apiRequest(`/resources/${resourceId}`, { method: 'DELETE' })
}

export function downloadNotebookResource(resourceId, filename) {
  return downloadResource(resourceId, filename)
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

export function getNotes() {
  return apiRequest('/notes')
}

export function createNote(payload) {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateNote(noteId, payload) {
  return apiRequest(`/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteNote(noteId) {
  return apiRequest(`/notes/${noteId}`, { method: 'DELETE' })
}
