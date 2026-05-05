import { Suspense, lazy, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import { formatShortDate } from '../../../utils/date'
import {
  downloadNotebookResource,
  getChapterResources,
  getNotes,
  getNotebookChapters,
  getTodos,
  updateChapter,
  uploadResource,
} from '../../notebook/notebook.api'

const MarkdownEditor = lazy(() => import('../components/MarkdownEditor'))

function EditChapter() {
  const { notebookId, chapterId } = useParams()
  const location = useLocation()
  const notebookState = location.state?.fromFolder
    ? { fromFolder: location.state.fromFolder }
    : { fromDashboard: true }
  const [chapter, setChapter] = useState(null)
  const [chapterForm, setChapterForm] = useState({ title: '', content: '' })
  const [resources, setResources] = useState([])
  const [relatedNotes, setRelatedNotes] = useState([])
  const [todoTitleById, setTodoTitleById] = useState({})
  const [resourceFile, setResourceFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    async function loadChapter() {
      try {
        const [chaptersData, resourcesData, todosData, notesData] = await Promise.all([
          getNotebookChapters(notebookId),
          getChapterResources(chapterId),
          getTodos('?limit=100'),
          getNotes(),
        ])
        const currentChapter = (chaptersData.chapters || []).find((item) => String(item.id) === String(chapterId))
        if (!currentChapter) {
          setError('Chapter not found.')
          return
        }

        setChapter(currentChapter)
        setChapterForm({
          title: currentChapter.title,
          content: currentChapter.content || '',
        })
        setResources(resourcesData.resources || [])
        const notebookTodos = (todosData.todos || []).filter((todo) => String(todo.notebook_id) === String(notebookId))
        const notebookTodoIds = new Set(notebookTodos.map((todo) => String(todo.id)))
        setTodoTitleById(Object.fromEntries(notebookTodos.map((todo) => [String(todo.id), todo.title])))
        setRelatedNotes((notesData.notes || []).filter((note) => note.todo_id && notebookTodoIds.has(String(note.todo_id))))
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadChapter()
  }, [notebookId, chapterId])

  async function submitEdit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      await updateChapter(chapterId, chapterForm)
      setChapter((current) => ({
        ...current,
        ...chapterForm,
        updated_at: new Date().toISOString(),
      }))
      setMessage('Chapter updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function download(resource) {
    setError('')
    try {
      await downloadNotebookResource(resource.id, resource.original_name)
    } catch (err) {
      setError(err.message)
    }
  }

  async function submitResourceUpload(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!resourceFile) {
      setError('Choose a file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', resourceFile)
    formData.append('notebook_id', notebookId)
    formData.append('chapter_id', chapterId)

    setIsUploading(true)
    try {
      await uploadResource(formData)
      const resourcesData = await getChapterResources(chapterId)
      setResources(resourcesData.resources || [])
      setResourceFile(null)
      event.currentTarget.reset()
      setMessage('Resource uploaded.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="chapter-detail-page">
      <ProtectedTopbar
        backLabel="Notebook"
        backState={notebookState}
        backTo={`/notebook/${notebookId}`}
        className="chapter-detail-topbar"
        title={chapter?.title || 'Chapter'}
      />

      <FeedbackBanner error={error} message={message} />

      {isLoading ? (
        <div className="notebook-loading">Loading chapter...</div>
      ) : (
        <div className="chapter-detail-layout">
          <aside className="chapter-editor-panel">
            <div className="notebook-panel-header">
              <h2>Edit Chapter</h2>
            </div>
            <form className="chapter-editor-form" onSubmit={submitEdit}>
              <label className="auth-form-label">
                Chapter Title
                <input
                  className="auth-form-input"
                  onChange={(event) => setChapterForm({ ...chapterForm, title: event.target.value })}
                  required
                  value={chapterForm.title}
                />
              </label>
              <label className="auth-form-label">
                Chapter Content
                <Suspense fallback={<div className="notebook-loading">Loading editor...</div>}>
                  <MarkdownEditor
                    key={`editor-${chapterId}`}
                    autoFocus
                    className="chapter-markdown-editor"
                    onChange={(content) => setChapterForm((current) => ({ ...current, content }))}
                    value={chapterForm.content}
                  />
                </Suspense>
              </label>
              <button className="auth-submit-btn" disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </aside>

          <section className="chapter-reader">
            <div className="chapter-reader__meta">
              <span>Created {formatShortDate(chapter?.created_at)}</span>
              <span>Updated {formatShortDate(chapter?.updated_at || chapter?.created_at)}</span>
            </div>
            <h2>{chapterForm.title || chapter?.title}</h2>
            <div className="chapter-reader__content markdown-preview-shell">
              {chapterForm.content ? (
                <Suspense fallback={<p className="muted">Loading preview...</p>}>
                  <MarkdownEditor
                    key={`preview-${chapterId}`}
                    readOnly
                    value={chapterForm.content}
                  />
                </Suspense>
              ) : (
                <p className="muted">No content yet.</p>
              )}
            </div>

            <div className="chapter-linked-resources">
              <div className="chapter-section-header">
                <h3>Linked Resources</h3>
              </div>
              <form className="chapter-resource-upload" onSubmit={submitResourceUpload}>
                <label className="chapter-resource-upload__field">
                  <span>Upload file</span>
                  <input
                    className="auth-form-input"
                    onChange={(event) => setResourceFile(event.target.files?.[0] || null)}
                    type="file"
                  />
                </label>
                <button className="ghost-button" disabled={isUploading} type="submit">
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
              {resources.length === 0 ? (
                <p className="muted">No resources linked to this chapter.</p>
              ) : (
                resources.map((resource) => (
                  <div className="resource-row" key={resource.id}>
                    <p>{resource.original_name}</p>
                    <button
                      aria-label={`Download ${resource.original_name}`}
                      className="resource-row__action"
                      onClick={() => download(resource)}
                      type="button"
                    >
                      ↓
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="chapter-related-notes">
              <div className="chapter-section-header">
                <h3>Notebook Notes</h3>
              </div>
              {relatedNotes.length === 0 ? (
                <p className="muted">No related notes from this notebook yet.</p>
              ) : (
                <div className="chapter-note-list">
                  {relatedNotes.map((note) => (
                    <article className="chapter-note-card" key={note.id}>
                      <div>
                        <h4>{note.title || 'Untitled note'}</h4>
                        <p>{note.content || 'No note content.'}</p>
                      </div>
                      <span>{todoTitleById[String(note.todo_id)] || 'Notebook task'}</span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default EditChapter
