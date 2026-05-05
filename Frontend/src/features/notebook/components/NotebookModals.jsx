import { Suspense, lazy } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import { getDefaultReminderAt } from '../../../utils/reminders'
import { NOTEBOOK_MODAL } from '../hooks/useNotebook'

const MarkdownEditor = lazy(() => import('../../chapter/components/MarkdownEditor'))

function NotebookModals({
  activeModal,
  chapterForm,
  chapters,
  noteForm,
  onChapterFormChange,
  onClose,
  onNoteFormChange,
  onResourceFormChange,
  onSubmitChapter,
  onSubmitNote,
  onSubmitResource,
  onSubmitTodo,
  resourceForm,
  todoForm,
  todos,
  onTodoFormChange,
}) {
  function handleDeadlineChange(value) {
    onTodoFormChange({
      ...todoForm,
      deadline: value,
      reminder_at: todoForm.reminder_at || getDefaultReminderAt(value),
    })
  }

  return (
    <>
      <Modal
        isOpen={activeModal === NOTEBOOK_MODAL.CHAPTER}
        onClose={onClose}
        size="wide"
        title="Add Chapter"
      >
        <form className="stack modal-form chapter-modal-form" onSubmit={onSubmitChapter}>
          <label className="auth-form-label">
            Chapter title
            <input
              className="auth-form-input"
              onChange={(event) => onChapterFormChange({ ...chapterForm, title: event.target.value })}
              required
              value={chapterForm.title}
            />
          </label>
          <label className="auth-form-label">
            Chapter content
            <Suspense fallback={<div className="notebook-loading">Loading editor...</div>}>
              <MarkdownEditor
                className="chapter-modal-markdown-editor"
                onChange={(content) => onChapterFormChange({ ...chapterForm, content })}
                placeholder="Draft a quick Markdown outline..."
                value={chapterForm.content}
              />
            </Suspense>
          </label>
          <button className="auth-submit-btn" type="submit">Create Chapter</button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === NOTEBOOK_MODAL.NOTE}
        onClose={onClose}
        size="dialog"
        title="Quick Note"
      >
        <form className="stack modal-form" onSubmit={onSubmitNote}>
          <label className="auth-form-label">
            Note title
            <input
              className="auth-form-input"
              onChange={(event) => onNoteFormChange({ ...noteForm, title: event.target.value })}
              required
              value={noteForm.title}
            />
          </label>
          <label className="auth-form-label">
            Note content
            <textarea
              className="auth-form-input"
              onChange={(event) => onNoteFormChange({ ...noteForm, content: event.target.value })}
              required
              rows="3"
              value={noteForm.content}
            />
          </label>
          <label className="auth-form-label">
            Linked todo
            <select
              className="auth-form-input"
              onChange={(event) => onNoteFormChange({ ...noteForm, todo_id: event.target.value })}
              value={noteForm.todo_id}
            >
              <option value="">No linked todo</option>
              {todos.map((todo) => <option key={todo.id} value={todo.id}>{todo.title}</option>)}
            </select>
          </label>
          <button className="auth-submit-btn" type="submit">Create Note</button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === NOTEBOOK_MODAL.TODO}
        onClose={onClose}
        size="dialog"
        title="Create Task"
      >
        <form className="stack modal-form" onSubmit={onSubmitTodo}>
          <label className="auth-form-label">
            Task title
            <input
              className="auth-form-input"
              onChange={(event) => onTodoFormChange({ ...todoForm, title: event.target.value })}
              required
              value={todoForm.title}
            />
          </label>
          <label className="auth-form-label">
            Deadline
            <input
              className="auth-form-input"
              onChange={(event) => handleDeadlineChange(event.target.value)}
              required
              type="datetime-local"
              value={todoForm.deadline}
            />
          </label>
          <label className="auth-form-label">
            Reminder
            <input
              className="auth-form-input"
              onChange={(event) => onTodoFormChange({ ...todoForm, reminder_at: event.target.value })}
              type="datetime-local"
              value={todoForm.reminder_at}
            />
          </label>
          <label className="auth-form-label">
            Weight (1-10)
            <input
              className="auth-form-input"
              max="10"
              min="1"
              onChange={(event) => onTodoFormChange({ ...todoForm, academic_weight: event.target.value })}
              required
              type="number"
              value={todoForm.academic_weight}
            />
          </label>
          <label className="auth-form-label">
            Effort (1-10)
            <input
              className="auth-form-input"
              max="10"
              min="1"
              onChange={(event) => onTodoFormChange({ ...todoForm, estimated_effort: event.target.value })}
              required
              type="number"
              value={todoForm.estimated_effort}
            />
          </label>
          <button className="auth-submit-btn" type="submit">Create Task</button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === NOTEBOOK_MODAL.RESOURCE}
        onClose={onClose}
        size="dialog"
        title="Upload Resource"
      >
        <form className="stack modal-form" onSubmit={onSubmitResource}>
          <label className="auth-form-label">
            Resource file
            <input
              className="auth-form-input"
              onChange={(event) => onResourceFormChange({
                ...resourceForm,
                file: event.target.files[0] || null,
              })}
              required
              type="file"
            />
          </label>
          <label className="auth-form-label">
            Attach to
            <select
              className="auth-form-input"
              onChange={(event) => onResourceFormChange({
                ...resourceForm,
                chapter_id: event.target.value,
              })}
              value={resourceForm.chapter_id}
            >
              <option value="">Notebook-level resource</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
              ))}
            </select>
          </label>
          <button className="auth-submit-btn" type="submit">Upload Resource</button>
        </form>
      </Modal>
    </>
  )
}

export default NotebookModals
