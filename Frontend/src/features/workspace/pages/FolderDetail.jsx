import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import Modal from '../../../shared/components/ui/Modal'
import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import { formatDateGroup, formatTime } from '../../../utils/date'
import NotebookCard from '../components/NotebookCard'
import {
  createNotebook,
  getFolderNotebooks,
  getFolders,
  getTodos,
} from '../workspace.api'

function groupTodosByDate(todos) {
  return todos.reduce((groups, todo) => {
    const dateKey = formatDateGroup(todo.deadline)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(todo)
    return groups
  }, {})
}

function FolderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [folder, setFolder] = useState(null)
  const [notebooks, setNotebooks] = useState([])
  const [todos, setTodos] = useState([])
  const [notebookTitle, setNotebookTitle] = useState('')
  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadFolder = useCallback(async () => {
    setError('')
    try {
      const [foldersData, notebooksData, todosData] = await Promise.all([
        getFolders(),
        getFolderNotebooks(id),
        getTodos('?limit=100'),
      ])
      const currentFolder = (foldersData.folders || []).find((item) => String(item.id) === String(id))
      if (!currentFolder) {
        navigate('/dashboard', { replace: true })
        return
      }

      const folderNotebooks = notebooksData.notebooks || []
      const notebookIds = new Set(folderNotebooks.map((notebook) => String(notebook.id)))
      const folderTodos = (todosData.todos || []).filter((todo) => (
        String(todo.folder_id) === String(id) || notebookIds.has(String(todo.notebook_id))
      ))

      setFolder(currentFolder)
      setNotebooks(folderNotebooks)
      setTodos(folderTodos)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFolder()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadFolder])

  const todoCountsByNotebookId = useMemo(() => {
    const counts = new Map()
    todos.forEach((todo) => {
      if (!todo.notebook_id) return
      counts.set(String(todo.notebook_id), (counts.get(String(todo.notebook_id)) || 0) + 1)
    })
    return counts
  }, [todos])

  const notebookTitleById = useMemo(
    () => new Map(notebooks.map((notebook) => [String(notebook.id), notebook.title])),
    [notebooks],
  )

  const groupedTodos = useMemo(() => groupTodosByDate(todos), [todos])
  const todoGroups = Object.entries(groupedTodos)

  async function submitNotebook(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await createNotebook({ title: notebookTitle, folder_id: id })
      setNotebookTitle('')
      setIsCreateNotebookOpen(false)
      setMessage('Notebook created.')
      await loadFolder()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="folder-detail-page">
      <ProtectedTopbar
        actions={(
          <button
            className="dashboard-tool-button dashboard-tool-button--text"
            onClick={() => setIsCreateNotebookOpen(true)}
            type="button"
          >
            Add Notebook
          </button>
        )}
        backLabel="Dashboard"
        backTo="/dashboard"
        className="folder-detail-topbar"
        title={folder?.title || 'Folder'}
      />

      <FeedbackBanner error={error} message={message} />

      {isLoading ? (
        <div className="notebook-loading">Loading folder...</div>
      ) : (
        <div className="folder-detail-layout">
          <section>
            <div className="folder-detail-section-header">
              <h2>Notebooks</h2>
              <div className="inline-actions">
                <span>{notebooks.length} items</span>
                <button
                  className="ghost-button ghost-button--small"
                  onClick={() => setIsCreateNotebookOpen(true)}
                  type="button"
                >
                  Add Notebook
                </button>
              </div>
            </div>
            <div className="folder-notebook-grid">
              {notebooks.map((notebook) => (
                <Link
                  className="workspace-item__link"
                  key={notebook.id}
                  state={{ fromFolder: { id, title: folder.title } }}
                  to={`/notebook/${notebook.id}`}
                >
                  <NotebookCard
                    taskCount={todoCountsByNotebookId.get(String(notebook.id)) || 0}
                    title={notebook.title}
                  />
                </Link>
              ))}
              {notebooks.length === 0 && <p className="muted">No notebooks in this folder yet.</p>}
            </div>
          </section>

          <aside className="notebook-panel folder-detail-timeline">
            <div className="notebook-panel-header">
              <h2>Timeline</h2>
            </div>
            {todoGroups.length === 0 ? (
              <p className="muted notebook-panel__empty">No folder tasks yet.</p>
            ) : (
              <div className="notebook-panel__scroller">
                {todoGroups.map(([date, groupTodos]) => (
                  <div key={date}>
                    <div className="date-header">{date}</div>
                    {groupTodos.map((todo) => (
                      <article className={`pill-card${todo.is_completed ? ' pill-card--completed' : ''}`} key={todo.id}>
                        <span className="pill-card__status" />
                        <div className="pill-card__copy">
                          <p className="pill-card-title">{todo.title}</p>
                          <p className="pill-card-subtitle">{formatTime(todo.deadline)}</p>
                        </div>
                        <span className="pill-card-meta">
                          {notebookTitleById.get(String(todo.notebook_id)) || folder.title}
                        </span>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <Modal
        isOpen={isCreateNotebookOpen}
        onClose={() => setIsCreateNotebookOpen(false)}
        size="dialog"
        title="Create Notebook"
      >
        <form className="stack modal-form" onSubmit={submitNotebook}>
          <label className="auth-form-label">
            Notebook title
            <input
              className="auth-form-input"
              onChange={(event) => setNotebookTitle(event.target.value)}
              required
              value={notebookTitle}
            />
          </label>
          <p className="muted folder-detail-modal-note">
            This notebook will be added to {folder?.title || 'this folder'}.
          </p>
          <button className="auth-submit-btn" type="submit">Create Notebook</button>
        </form>
      </Modal>
    </main>
  )
}

export default FolderDetail
