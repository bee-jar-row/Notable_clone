import { formatCountdown, useFocusSession } from './FocusSessionContext'

function FocusTimerWidget() {
  const {
    activeSession,
    endFocus,
    isExpired,
    openOverlay,
    progress,
    remainingSeconds,
  } = useFocusSession()

  const todos = activeSession?.todos || []
  const activeTodo = todos.find((todo) => todo.is_completed !== 1) || todos[0]
  const completedCount = todos.filter((todo) => todo.is_completed === 1).length
  const progressPercent = Math.round(progress * 100)

  if (!activeSession) return null

  return (
    <aside className={isExpired ? 'focus-timer-widget is-expired' : 'focus-timer-widget'} aria-label="Active focus timer">
      <div className="focus-timer-widget__header">
        <span>{isExpired ? "Time's up" : 'Focus Session'}</span>
        <strong>{formatCountdown(remainingSeconds)}</strong>
      </div>
      <div className="focus-timer-widget__progress" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>
      <p>{activeTodo?.title || 'Focus block running'}</p>
      <span className="focus-timer-widget__meta">
        {completedCount}/{todos.length} tasks complete
      </span>
      <div className="focus-timer-widget__actions">
        <button className="ghost-button ghost-button--small" onClick={openOverlay} type="button">
          Open
        </button>
        <button onClick={() => endFocus(activeSession.id)} type="button">
          {isExpired ? 'Finish Session' : 'End'}
        </button>
      </div>
    </aside>
  )
}

export default FocusTimerWidget
