import { formatDateGroup, formatTime } from '../../../utils/date'
import { formatBhpsScore, getFocusCue, getLoadMeta, getPriorityMeta } from '../../../utils/priority'
import { getReminderMeta } from '../../../utils/reminders'
import { DASHBOARD_MODAL } from '../hooks/useDashboard'

function TimelinePanel({ onCompleteTodo, onDeleteTodo, onOpenModal, todos }) {
  const groupedTodos = todos.reduce((groups, todo) => {
    const dateKey = formatDateGroup(todo.deadline, 'No Date')
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(todo)
    return groups
  }, {})
  const groups = Object.entries(groupedTodos)

  return (
    <aside className="dashboard-panel dashboard-panel--timeline">
      <div className="dashboard-panel__header">
        <h2>All To Do</h2>
        <button
          aria-label="Create todo"
          className="plus-btn dashboard-panel__plus"
          onClick={() => onOpenModal(DASHBOARD_MODAL.TODO)}
          type="button"
        >
          +
        </button>
      </div>
      <div className="dashboard-panel__body">
        <div className="dashboard-panel__scroller">
          {groups.map(([date, groupTodos]) => (
            <div key={date}>
              <div className="dashboard-date-header">{date}</div>
              {groupTodos.map((todo) => {
                const priority = getPriorityMeta(todo)
                const load = getLoadMeta(todo)
                const reminder = getReminderMeta(todo)
                const rowClassName = [
                  'dashboard-task-row',
                  `dashboard-task-row--priority-${priority.tone}`,
                  `dashboard-task-row--reminder-${reminder.tone}`,
                  todo.is_completed ? 'dashboard-task-row--completed' : '',
                ].filter(Boolean).join(' ')

                return (
                  <article className={rowClassName} key={todo.id}>
                    <button
                      aria-label={todo.is_completed ? `${todo.title} completed` : `Mark ${todo.title} complete`}
                      className="dashboard-check-button"
                      disabled={todo.is_completed === 1}
                      onClick={() => onCompleteTodo(todo.id)}
                      type="button"
                    />
                    <div className="dashboard-task-row__content">
                      <strong>{todo.title}</strong>
                      <p className="dashboard-task-row__meta">
                        <span>{formatTime(todo.deadline)}</span>
                        <span>{getFocusCue(todo)}</span>
                      </p>
                    </div>
                    <div className="dashboard-task-row__actions">
                      {reminder.tone !== 'none' && (
                        <span className={`reminder-badge reminder-badge--${reminder.tone}`}>
                          {reminder.label}
                        </span>
                      )}
                      <span className={`priority-badge priority-badge--${priority.tone}`}>
                        {priority.label} {formatBhpsScore(todo)}
                      </span>
                      <span className={`load-badge load-badge--${load.tone}`}>{load.label}</span>
                      <button
                        aria-label={`Delete ${todo.title}`}
                        className="dashboard-row-delete"
                        onClick={() => onDeleteTodo(todo.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
          {todos.length === 0 && <p className="muted dashboard-panel__empty">No todos yet.</p>}
        </div>
      </div>
    </aside>
  )
}

export default TimelinePanel
