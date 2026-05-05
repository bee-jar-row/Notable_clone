import Modal from '../../../shared/components/ui/Modal'
import { formatTime } from '../../../utils/date'
import { formatBhpsScore, getFocusCue, getPriorityMeta } from '../../../utils/priority'

function formatDuration(minutes) {
  const value = Number(minutes) || 0
  if (value < 60) return `${value} min`

  const hours = Math.floor(value / 60)
  const remainingMinutes = value % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function FocusSummaryModal({ onClose, summary }) {
  const isOpen = Boolean(summary)
  const todos = summary?.todos || []
  const completionRate = Number(summary?.completion_rate) || 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="wide" title="Focus Summary">
      {summary && (
        <section className="focus-summary" aria-label="Focus session summary">
          <div className="focus-summary__hero">
            <div>
              <span className="focus-summary__eyebrow">Session complete</span>
              <h3>{summary.completed_todos} of {summary.total_todos} tasks completed</h3>
              <p>
                Actual focus time {formatDuration(summary.actual_duration_minutes)} from a planned {formatDuration(summary.planned_duration_minutes)} block.
              </p>
            </div>
            <div className="focus-summary__score" aria-label={`${completionRate}% complete`}>
              <strong>{completionRate}%</strong>
              <span>complete</span>
            </div>
          </div>

          <div className="focus-summary__progress" aria-hidden="true">
            <span style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }} />
          </div>

          <div className="focus-summary__stats">
            <span>{summary.remaining_todos} remaining</span>
            <span>{summary.completed_estimated_effort}/{summary.total_estimated_effort} effort cleared</span>
            <span>{summary.cognitive_load} load</span>
          </div>

          <div className="focus-summary__next">
            <strong>{summary.next_action?.title}</strong>
            <p>{summary.next_action?.detail}</p>
          </div>

          <div className="focus-summary__tasks" aria-label="Focus session task outcomes">
            {todos.map((todo) => {
              const priority = getPriorityMeta(todo)
              const isComplete = todo.is_completed === 1

              return (
                <article className={isComplete ? 'focus-summary-task is-complete' : 'focus-summary-task'} key={todo.id}>
                  <span className={isComplete ? 'focus-summary-task__status is-complete' : 'focus-summary-task__status'}>
                    {isComplete ? 'Done' : 'Next'}
                  </span>
                  <div>
                    <strong>{todo.title}</strong>
                    <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                  </div>
                  <span className={`priority-badge priority-badge--${priority.tone}`}>
                    {priority.label} {formatBhpsScore(todo)}
                  </span>
                </article>
              )
            })}
          </div>

          <div className="focus-summary__actions">
            <button onClick={onClose} type="button">Back to Dashboard</button>
          </div>
        </section>
      )}
    </Modal>
  )
}

export default FocusSummaryModal
