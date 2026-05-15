import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDefaultReminderAt, getReminderMeta, toIsoOrNull } from '../../../utils/reminders'
import { getFocusRecommendations } from '../../focus/focus.api'
import {
  completeTodo as completeTodoRequest,
  createFolder,
  createNotebook,
  createTodo,
  deleteNotebook as deleteNotebookRequest,
  deleteTodo as deleteTodoRequest,
  getFolders,
  getNotebooks,
  getTodos,
} from '../../workspace/workspace.api'
import { getProfile } from '../../settings/settings.api'

const EMPTY_TODO = {
  title: '',
  deadline: '',
  academic_weight: '5',
  estimated_effort: '3',
  folder_id: '',
  notebook_id: '',
  reminder_at: '',
}

export const DASHBOARD_MODAL = {
  FOLDER: 'folder',
  NOTEBOOK: 'notebook',
  TODO: 'todo',
  GCAL: 'gcal',
}

function getDefaultState(user) {
  return {
    folders: [],
    notebooks: [],
    profile: user,
    recommendedBlock: null,
    recommendedTodos: [],
    todos: [],
  }
}

function todoMatchesStatus(todo, statusFilter) {
  if (statusFilter === 'active') return todo.is_completed === 0
  if (statusFilter === 'completed') return todo.is_completed === 1
  return true
}

export function useDashboard(auth) {
  const { updateUser } = auth
  const [data, setData] = useState(() => getDefaultState(auth.user))
  const [folderTitle, setFolderTitle] = useState('')
  const [notebookTitle, setNotebookTitle] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [todoForm, setTodoForm] = useState(EMPTY_TODO)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortMode, setSortMode] = useState('newest')
  const [activeModal, setActiveModal] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setError('')
    try {
      const [
        profileData,
        foldersData,
        notebooksData,
        todosData,
        recommendedData,
      ] = await Promise.all([
        getProfile(),
        getFolders(),
        getNotebooks(),
        getTodos('?limit=100'),
        getFocusRecommendations(),
      ])

      updateUser(profileData.user)
      setData({
        folders: foldersData.folders || [],
        notebooks: notebooksData.notebooks || [],
        profile: profileData.user,
        recommendedBlock: recommendedData.recommended_block || null,
        recommendedTodos: recommendedData.recommended_todos || [],
        todos: todosData.todos || [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [updateUser])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  const filteredTodosByStatus = useMemo(
    () => data.todos.filter((todo) => todoMatchesStatus(todo, statusFilter)),
    [data.todos, statusFilter],
  )

  const todoCountsByNotebookId = useMemo(() => {
    const counts = new Map()
    filteredTodosByStatus.forEach((todo) => {
      if (!todo.notebook_id) return
      counts.set(todo.notebook_id, (counts.get(todo.notebook_id) || 0) + 1)
    })
    return counts
  }, [filteredTodosByStatus])

  const todoCountsByFolderId = useMemo(() => {
    const notebookFolderIds = new Map(
      data.notebooks.map((notebook) => [notebook.id, notebook.folder_id]),
    )
    const counts = new Map()

    filteredTodosByStatus.forEach((todo) => {
      const folderId = todo.folder_id || notebookFolderIds.get(todo.notebook_id)
      if (!folderId) return
      counts.set(folderId, (counts.get(folderId) || 0) + 1)
    })

    return counts
  }, [data.notebooks, filteredTodosByStatus])

  const visibleWorkspaceItems = useMemo(() => {
    const folderItems = data.folders.map((folder) => ({
      ...folder,
      type: 'folder',
      taskCount: todoCountsByFolderId.get(folder.id) || 0,
    }))
    const notebookItems = data.notebooks.map((notebook) => ({
      ...notebook,
      type: 'notebook',
      taskCount: todoCountsByNotebookId.get(notebook.id) || 0,
    }))

    return [...folderItems, ...notebookItems]
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .sort((first, second) => {
        if (sortMode === 'az') return first.title.localeCompare(second.title)
        if (sortMode === 'mostTodos') return second.taskCount - first.taskCount || first.title.localeCompare(second.title)
        if (sortMode === 'leastTodos') return first.taskCount - second.taskCount || first.title.localeCompare(second.title)
        return new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
      })
  }, [
    data.folders,
    data.notebooks,
    sortMode,
    todoCountsByFolderId,
    todoCountsByNotebookId,
    typeFilter,
  ])

  const visibleTimelineTodos = useMemo(() => {
    return filteredTodosByStatus
  }, [filteredTodosByStatus])

  const reminderTodos = useMemo(() => {
    const now = new Date()
    return data.todos
      .filter((todo) => todo.is_completed === 0)
      .map((todo) => ({
        ...todo,
        reminderMeta: getReminderMeta(todo, now),
      }))
      .filter((todo) => todo.reminderMeta.tone !== 'none')
      .sort((first, second) => (
        first.reminderMeta.rank - second.reminderMeta.rank
        || new Date(first.reminder_at || first.deadline).getTime() - new Date(second.reminder_at || second.deadline).getTime()
      ))
      .slice(0, 6)
  }, [data.todos])

  const runMutation = useCallback(async (mutation, successMessage, afterSuccess) => {
    setError('')
    setMessage('')
    try {
      await mutation()
      afterSuccess?.()
      setMessage(successMessage)
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }, [loadDashboard])

  const closeModal = useCallback(() => setActiveModal(null), [])
  const openModal = useCallback((modal) => setActiveModal(modal), [])

  const submitFolder = useCallback((event) => {
    event.preventDefault()
    return runMutation(
      () => createFolder({ title: folderTitle }),
      'Folder created.',
      () => {
        setFolderTitle('')
        closeModal()
      },
    )
  }, [closeModal, folderTitle, runMutation])

  const submitNotebook = useCallback((event) => {
    event.preventDefault()
    return runMutation(
      () => createNotebook({ title: notebookTitle, folder_id: selectedFolder || null }),
      'Notebook created.',
      () => {
        setNotebookTitle('')
        setSelectedFolder('')
        closeModal()
      },
    )
  }, [closeModal, notebookTitle, runMutation, selectedFolder])

  const submitTodo = useCallback((event) => {
    event.preventDefault()
    return runMutation(
      () => createTodo({
        title: todoForm.title,
        deadline: todoForm.deadline,
        folder_id: todoForm.folder_id || null,
        notebook_id: todoForm.notebook_id || null,
        academic_weight: Number(todoForm.academic_weight),
        estimated_effort: Number(todoForm.estimated_effort),
        reminder_at: toIsoOrNull(todoForm.reminder_at) || toIsoOrNull(getDefaultReminderAt(todoForm.deadline)),
      }),
      'Todo created.',
      () => {
        setTodoForm(EMPTY_TODO)
        closeModal()
      },
    )
  }, [closeModal, runMutation, todoForm])

  const completeTodo = useCallback((todoId) => runMutation(
    () => completeTodoRequest(todoId),
    'Todo completed.',
  ), [runMutation])

  const deleteTodo = useCallback((todoId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return undefined

    return runMutation(
      () => deleteTodoRequest(todoId),
      'Todo deleted.',
    )
  }, [runMutation])

  const deleteNotebook = useCallback((notebookId) => {
    if (!window.confirm('Are you sure you want to delete this notebook?')) return undefined

    return runMutation(
      () => deleteNotebookRequest(notebookId),
      'Notebook deleted.',
    )
  }, [runMutation])

  return {
    activeModal,
    closeModal,
    completeTodo,
    data,
    deleteNotebook,
    deleteTodo,
    error,
    folderTitle,
    isLoading,
    message,
    notebookTitle,
    openModal,
    selectedFolder,
    setFolderTitle,
    setNotebookTitle,
    setSelectedFolder,
    setSortMode,
    setStatusFilter,
    setTodoForm,
    setTypeFilter,
    sortMode,
    statusFilter,
    submitFolder,
    submitNotebook,
    submitTodo,
    todoForm,
    typeFilter,
    reminderTodos,
    visibleTimelineTodos,
    visibleWorkspaceItems,
  }
}
