import { useMemo, useState } from 'react'
import Modal from '../../shared/components/ui/Modal'
import { formatTime } from '../../utils/date'

function normalizeSessionForm(session) {
  return {
    duration_minutes: String(session?.duration_minutes || 50),
    session_notes: session?.session_notes || '',
    title: session?.title || '',
    todo_ids: (session?.todos || []).map((todo) => String(todo.id)),
  }
}

function FocusSessionEditModal({
  activeSession,
  availableTodos,
  isOpen,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => normalizeSessionForm(activeSession))
  const [isSaving, setIsSaving] = useState(false)

  const todoOptions = useMemo(() => {
    const selectedIds = new Set((activeSession?.todos || []).map((todo) => String(todo.id)))
    const byId = new Map()

    ;(activeSession?.todos || []).forEach((todo) => {
      byId.set(String(todo.id), todo)
    })
    ;(availableTodos || []).forEach((todo) => {
      if (todo.is_completed !== 1 || selectedIds.has(String(todo.id))) {
        byId.set(String(todo.id), todo)
      }
    })

    return [...byId.values()].sort((first, second) => {
      const firstCompleted = first.is_completed === 1 ? 1 : 0
      const secondCompleted = second.is_completed === 1 ? 1 : 0
      if (firstCompleted !== secondCompleted) return firstCompleted - secondCompleted
      return String(first.title).localeCompare(String(second.title))
    })
  }, [activeSession?.todos, availableTodos])

  function toggleTodo(todoId) {
    setForm((current) => {
      const todoIds = new Set(current.todo_ids)
      if (todoIds.has(String(todoId))) {
        todoIds.delete(String(todoId))
      } else {
        todoIds.add(String(todoId))
      }

      return { ...current, todo_ids: [...todoIds] }
    })
  }

  async function submit(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      await onSubmit({
        duration_minutes: Number(form.duration_minutes),
        session_notes: form.session_notes,
        title: form.title,
        todo_ids: form.todo_ids,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="wide" title="Edit Focus Session">
      <form className="focus-edit-form" onSubmit={submit}>
        <div className="focus-edit-grid">
          <label className="auth-form-label">
            Session title
            <input
              className="auth-form-input"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Thesis writing block"
              value={form.title}
            />
          </label>
          <label className="auth-form-label">
            Duration
            <input
              className="auth-form-input"
              max="180"
              min="5"
              onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })}
              required
              type="number"
              value={form.duration_minutes}
            />
          </label>
        </div>

        <label className="auth-form-label">
          Session notes
          <textarea
            className="auth-form-input"
            onChange={(event) => setForm({ ...form, session_notes: event.target.value })}
            placeholder="What should this block stay focused on?"
            rows="3"
            value={form.session_notes}
          />
        </label>

        <div className="focus-edit-task-picker">
          <div className="focus-edit-task-picker__header">
            <strong>Tasks in this block</strong>
            <span>{form.todo_ids.length} selected</span>
          </div>
          <div className="focus-edit-task-list">
            {todoOptions.length === 0 ? (
              <p className="muted">No active tasks available.</p>
            ) : (
              todoOptions.map((todo) => {
                const checked = form.todo_ids.includes(String(todo.id))
                const completed = todo.is_completed === 1

                return (
                  <label className={completed ? 'focus-edit-task is-complete' : 'focus-edit-task'} key={todo.id}>
                    <input
                      checked={checked}
                      onChange={() => toggleTodo(todo.id)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{todo.title}</strong>
                      <small>{completed ? 'Completed' : formatTime(todo.deadline)}</small>
                    </span>
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="focus-edit-actions">
          <button className="ghost-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save Focus'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FocusSessionEditModal
