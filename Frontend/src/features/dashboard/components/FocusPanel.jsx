import { formatTime } from '../../../utils/date'
import { formatBhpsScore, getFocusCue, getLoadMeta, getPriorityMeta } from '../../../utils/priority'
import { formatCountdown } from '../../focus/FocusSessionContext'

function FocusPanel({
  activeSession,
  isExpired,
  onCompleteTodo,
  onEndFocus,
  onOpenFocus,
  onPrepareFocus,
  progress,
  recommendedBlock,
  recommendedTodos,
  remainingSeconds,
}) {
  const recommendations = (recommendedTodos || []).slice(0, 3)
  const studyBlock = recommendedBlock || null
  const blockTodos = studyBlock?.todos?.length ? studyBlock.todos : recommendations
  const topTodo = blockTodos[0]
  const topPriority = topTodo ? getPriorityMeta(topTodo) : null
  const topLoad = topTodo ? getLoadMeta(topTodo) : null
  const sessionTodos = activeSession?.todos || []
  const startedAt = activeSession
    ? new Date(activeSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
  const progressPercent = Math.round((Number(progress) || 0) * 100)

  return (
    <aside className="dashboard-panel dashboard-panel--focus">
        <div className="dashboard-panel__header">
          <h2>Focus Session</h2>
        </div>
        <div className="dashboard-panel__body focus-panel__body">
          {activeSession ? (
            <div className="focus-panel__content focus-panel__content--recommendations">
              <div className={isExpired ? 'focus-panel-timer is-expired' : 'focus-panel-timer'}>
                <span>{isExpired ? "Time's up" : 'Active block'}</span>
                <strong>{formatCountdown(remainingSeconds)}</strong>
                <p>{activeSession.title || `Started at ${startedAt}`}. Finish one step at a time.</p>
                <div className="focus-panel-timer__bar" aria-hidden="true">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              {sessionTodos.length > 0 && (
                <div className="focus-session-task-list" aria-label="Tasks in this focus session">
                  {sessionTodos.map((todo) => {
                    const isComplete = todo.is_completed === 1

                    return (
                      <article className={isComplete ? 'focus-session-task is-complete' : 'focus-session-task'} key={todo.id}>
                        <button
                          aria-label={isComplete ? `${todo.title} completed` : `Complete ${todo.title}`}
                          className={isComplete ? 'focus-session-task__status is-complete' : 'focus-session-task__status'}
                          disabled={isComplete}
                          onClick={() => onCompleteTodo(todo.id)}
                          type="button"
                        />
                        <div>
                          <strong>{todo.title}</strong>
                          <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
              <div className="focus-panel__actions">
                <button className="ghost-button" onClick={onOpenFocus} type="button">
                  Open Focus
                </button>
                <button onClick={() => onEndFocus(activeSession.id)} type="button">
                  {isExpired ? 'Finish Session' : 'End Session'}
                </button>
              </div>
            </div>
          ) : (
            <div className="focus-panel__content focus-panel__content--recommendations">
              {topTodo ? (
                <>
                  <div>
                    <strong>{studyBlock?.title || `Start with ${topTodo.title}`}</strong>
                    <p className="muted">
                      Review this block before starting. {studyBlock?.reason || `BHPS picked this because it is ${topPriority.label.toLowerCase()} priority with a ${topLoad.label.toLowerCase()} load.`}
                    </p>
                  </div>
                  <div className="focus-block-summary">
                    <span>{studyBlock?.duration_minutes || 50} min</span>
                    <span>{studyBlock?.cognitive_load || topLoad.label} load</span>
                    <span>{studyBlock?.topic?.title || 'Today'}</span>
                  </div>
                  {studyBlock?.steps?.length > 0 && (
                    <div className="focus-step-list" aria-label="Recommended study sequence">
                      {studyBlock.steps.map((step, index) => (
                        <article className="focus-step" key={step.key || step.title}>
                          <span>{index + 1}</span>
                          <div>
                            <strong>{step.title}</strong>
                            <p>{step.detail}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  <div className="focus-recommendation-list" aria-label="Recommended focus tasks">
                    {blockTodos.map((todo, index) => {
                      const priority = getPriorityMeta(todo)
                      const load = getLoadMeta(todo)

                      return (
                        <article className="focus-recommendation-card" key={todo.id}>
                          <span className="focus-recommendation-card__rank">{index + 1}</span>
                          <div className="focus-recommendation-card__main">
                            <strong>{todo.title}</strong>
                            <p>
                              {formatTime(todo.deadline)}
                              <span aria-hidden="true"> / </span>
                              {getFocusCue(todo)}
                            </p>
                          </div>
                          <div className="focus-recommendation-card__meta">
                            <span className={`priority-badge priority-badge--${priority.tone}`}>
                              {priority.label} {formatBhpsScore(todo)}
                            </span>
                            <span className={`load-badge load-badge--${load.tone}`}>{load.label}</span>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                  {(studyBlock?.notes?.length > 0 || studyBlock?.resources?.length > 0) && (
                    <div className="focus-support-grid">
                      {studyBlock.notes?.length > 0 && (
                        <div>
                          <strong>Notes</strong>
                          {studyBlock.notes.slice(0, 3).map((note) => (
                            <p key={note.id}>{note.title}</p>
                          ))}
                        </div>
                      )}
                      {studyBlock.resources?.length > 0 && (
                        <div>
                          <strong>Resources</strong>
                          {studyBlock.resources.slice(0, 3).map((resource) => (
                            <p key={resource.id}>{resource.original_name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => onPrepareFocus({
                      duration_minutes: studyBlock?.duration_minutes || 50,
                      reason: studyBlock?.reason || '',
                      title: studyBlock?.title || `Focus: ${topTodo.title}`,
                      todos: blockTodos,
                    })}
                    type="button"
                  >
                    Prepare Focus
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <strong>No focus recommendation yet</strong>
                    <p className="muted">Add active tasks with deadlines and effort estimates to unlock BHPS recommendations.</p>
                  </div>
                  <button disabled type="button">
                    Prepare Focus
                  </button>
                </>
              )}
            </div>
          )}
        </div>
    </aside>
  )
}

export default FocusPanel
