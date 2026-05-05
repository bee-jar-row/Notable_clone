import { useMemo, useState } from 'react'
import Modal from '../../shared/components/ui/Modal'
import { formatTime } from '../../utils/date'

function normalizePrepareForm(draft) {
  const todos = draft?.todos || []
  const firstTodo = todos[0]

  return {
    duration_minutes: String(draft?.duration_minutes || 50),
    session_notes: draft?.reason || '',
    title: draft?.title || (firstTodo ? `Focus: ${firstTodo.title}` : ''),
    todo_ids: todos.map((todo) => String(todo.id)),
  }
}

function FocusSessionPrepareModal({
  availableTodos,
  draft,
  isOpen,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => normalizePrepareForm(draft))
  const [isSaving, setIsSaving] = useState(false)

  const todoOptions = useMemo(() => {
    const byId = new Map()

    ;(draft?.todos || []).forEach((todo) => {
      byId.set(String(todo.id), todo)
    })
    ;(availableTodos || []).forEach((todo) => {
      if (todo.is_completed !== 1) {
        byId.set(String(todo.id), todo)
      }
    })

    return [...byId.values()].sort((first, second) => {
      const firstSelected = form.todo_ids.includes(String(first.id)) ? 0 : 1
      const secondSelected = form.todo_ids.includes(String(second.id)) ? 0 : 1
      if (firstSelected !== secondSelected) return firstSelected - secondSelected
      return String(first.title).localeCompare(String(second.title))
    })
  }, [availableTodos, draft?.todos, form.todo_ids])

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
    <Modal isOpen={isOpen} onClose={onClose} size="wide" title="Prepare Focus Session">
      <form className="focus-edit-form" onSubmit={submit}>
        <div className="focus-prepare-intro">
          <strong>Review this block before starting.</strong>
          <p className="muted">Tune the duration, notes, and task list now. Once the timer starts, the session stays simple.</p>
        </div>

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

                return (
                  <label className="focus-edit-task" key={todo.id}>
                    <input
                      checked={checked}
                      onChange={() => toggleTodo(todo.id)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{todo.title}</strong>
                      <small>{formatTime(todo.deadline)}</small>
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
          <button disabled={isSaving || form.todo_ids.length === 0} type="submit">
            {isSaving ? 'Starting...' : 'Start Focus'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FocusSessionPrepareModal
