import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDateGroup } from '../../../utils/date'
import { getDefaultReminderAt, toIsoOrNull } from '../../../utils/reminders'
import {
  completeTodo as completeTodoRequest,
  createChapter,
  createNote,
  createTodo,
  deleteChapter as deleteChapterRequest,
  deleteTodo as deleteTodoRequest,
  downloadNotebookResource,
  getNotebookChapters,
  getNotebookResources,
  getNotebooks,
  getNotes,
  getTodos,
  uploadResource,
} from '../notebook.api'

const EMPTY_CHAPTER_FORM = { title: '', content: '' }
const EMPTY_NOTE_FORM = { title: '', content: '', todo_id: '' }
const EMPTY_RESOURCE_FORM = { file: null, chapter_id: '' }
const EMPTY_TODO_FORM = {
  title: '',
  deadline: '',
  reminder_at: '',
  academic_weight: '5',
  estimated_effort: '3',
}

export const NOTEBOOK_MODAL = {
  CHAPTER: 'chapter',
  NOTE: 'note',
  RESOURCE: 'resource',
  TODO: 'todo',
}

function groupTodosByDate(todos) {
  return todos.reduce((groups, todo) => {
    const dateKey = formatDateGroup(todo.deadline)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(todo)
    return groups
  }, {})
}

export function useNotebook({ id, onChapterCreated, onMissingNotebook }) {
  const [notebook, setNotebook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [resources, setResources] = useState([])
  const [todos, setTodos] = useState([])
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [chapterForm, setChapterForm] = useState(EMPTY_CHAPTER_FORM)
  const [noteForm, setNoteForm] = useState(EMPTY_NOTE_FORM)
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE_FORM)
  const [todoForm, setTodoForm] = useState(EMPTY_TODO_FORM)
  const [activeModal, setActiveModal] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadNotebook = useCallback(async () => {
    setError('')
    try {
      const [notebooksData, chaptersData, resourcesData, todosData, notesData] = await Promise.all([
        getNotebooks(),
        getNotebookChapters(id),
        getNotebookResources(id),
        getTodos('?limit=100'),
        getNotes(),
      ])
      const currentNotebook = notebooksData.notebooks.find((item) => String(item.id) === String(id))
      if (!currentNotebook) {
        onMissingNotebook()
        return
      }

      const notebookTodos = (todosData.todos || []).filter((todo) => String(todo.notebook_id) === String(id))
      const notebookTodoIds = new Set(notebookTodos.map((todo) => String(todo.id)))

      setNotebook(currentNotebook)
      setChapters(chaptersData.chapters || [])
      setResources(resourcesData.resources || [])
      setTodos(notebookTodos)
      setNotes((notesData.notes || []).filter((note) => notebookTodoIds.has(String(note.todo_id))))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [id, onMissingNotebook])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadNotebook()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadNotebook])

  const filteredChapters = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return chapters

    return chapters.filter((chapter) => (
      chapter.title.toLowerCase().includes(query)
      || (chapter.content || '').toLowerCase().includes(query)
    ))
  }, [chapters, search])

  const groupedTodos = useMemo(() => groupTodosByDate(todos), [todos])

  const runMutation = useCallback(async (mutation, successMessage, afterSuccess) => {
    setError('')
    setMessage('')
    try {
      const result = await mutation()
      afterSuccess?.(result)
      setMessage(successMessage)
      await loadNotebook()
      return result
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [loadNotebook])

  const closeModal = useCallback(() => setActiveModal(null), [])
  const openModal = useCallback((modal) => setActiveModal(modal), [])

  const submitChapter = useCallback((event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    return createChapter(id, chapterForm)
      .then(async (result) => {
        setChapterForm(EMPTY_CHAPTER_FORM)
        closeModal()
        setMessage('Chapter created.')
        await loadNotebook()
        if (result?.chapterId) {
          onChapterCreated?.(result.chapterId)
        }
      })
      .catch((err) => setError(err.message))
  }, [chapterForm, closeModal, id, loadNotebook, onChapterCreated])

  const submitNote = useCallback((event) => {
    event.preventDefault()
    return runMutation(
      () => createNote({
        title: noteForm.title,
        content: noteForm.content,
        todo_id: noteForm.todo_id || null,
      }),
      'Note created.',
      () => {
        setNoteForm(EMPTY_NOTE_FORM)
        closeModal()
      },
    )
  }, [closeModal, noteForm, runMutation])

  const submitResource = useCallback((event) => {
    event.preventDefault()
    if (!resourceForm.file) {
      setError('Choose a file first.')
      return undefined
    }

    const formData = new FormData()
    formData.append('file', resourceForm.file)
    formData.append('notebook_id', id)
    if (resourceForm.chapter_id) {
      formData.append('chapter_id', resourceForm.chapter_id)
    }

    return runMutation(
      () => uploadResource(formData),
      'Resource uploaded.',
      () => {
        setResourceForm(EMPTY_RESOURCE_FORM)
        closeModal()
      },
    )
  }, [closeModal, id, resourceForm, runMutation])

  const submitTodo = useCallback((event) => {
    event.preventDefault()
    return runMutation(
      () => createTodo({
        title: todoForm.title,
        deadline: todoForm.deadline,
        folder_id: null,
        notebook_id: id,
        academic_weight: Number(todoForm.academic_weight),
        estimated_effort: Number(todoForm.estimated_effort),
        reminder_at: toIsoOrNull(todoForm.reminder_at) || toIsoOrNull(getDefaultReminderAt(todoForm.deadline)),
      }),
      'Todo created.',
      () => {
        setTodoForm(EMPTY_TODO_FORM)
        closeModal()
      },
    )
  }, [closeModal, id, runMutation, todoForm])

  const download = useCallback(async (resource) => {
    setError('')
    try {
      await downloadNotebookResource(resource.id, resource.original_name)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const deleteChapter = useCallback((chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return undefined

    return runMutation(
      () => deleteChapterRequest(chapterId),
      'Chapter deleted.',
    )
  }, [runMutation])

  const deleteTodo = useCallback((todoId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return undefined

    return runMutation(
      () => deleteTodoRequest(todoId),
      'Todo deleted.',
    )
  }, [runMutation])

  const completeTodo = useCallback((todoId) => runMutation(
    () => completeTodoRequest(todoId),
    'Todo completed.',
  ), [runMutation])

  return {
    activeModal,
    chapterForm,
    chapters,
    closeModal,
    completeTodo,
    deleteChapter,
    deleteTodo,
    download,
    error,
    filteredChapters,
    groupedTodos,
    isLoading,
    message,
    noteForm,
    notes,
    notebook,
    openModal,
    resourceForm,
    resources,
    search,
    setChapterForm,
    setNoteForm,
    setResourceForm,
    setSearch,
    setTodoForm,
    submitChapter,
    submitNote,
    submitResource,
    submitTodo,
    todoForm,
    todos,
  }
}
