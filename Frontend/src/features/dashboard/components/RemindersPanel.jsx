import { formatTime } from '../../../utils/date'
import { formatReminderDateTime } from '../../../utils/reminders'

function RemindersPanel({ reminders }) {
  return (
    <aside className="dashboard-panel dashboard-panel--reminders">
      <div className="dashboard-panel__header">
        <h2>Reminders</h2>
        <span className="dashboard-panel__count">{reminders.length}</span>
      </div>
      <div className="dashboard-panel__body reminders-panel__body">
        {reminders.length === 0 ? (
          <p className="muted dashboard-panel__empty">No active reminders.</p>
        ) : (
          <div className="reminder-list">
            {reminders.map((todo) => (
              <article className={`reminder-row reminder-row--${todo.reminderMeta.tone}`} key={todo.id}>
                <span className={`reminder-badge reminder-badge--${todo.reminderMeta.tone}`}>
                  {todo.reminderMeta.label}
                </span>
                <div>
                  <strong>{todo.title}</strong>
                  <p>
                    Due {formatTime(todo.deadline)}
                    <span aria-hidden="true"> / </span>
                    {formatReminderDateTime(todo.reminder_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default RemindersPanel
