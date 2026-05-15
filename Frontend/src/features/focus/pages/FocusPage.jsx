import { useEffect, useState } from 'react'
import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import { formatTime } from '../../../utils/date'
import { getFocusRecommendations } from '../focus.api'
import { formatBhpsScore, getFocusCue, getLoadMeta, getPriorityMeta } from '../../../utils/priority'
import { formatCountdown, useFocusSession } from '../FocusSessionContext'

const styles = `
  .focus-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #f5f4f1;
  }

  .focus-page-topbar {
    flex-shrink: 0;
    margin: 0;
    border-radius: 0;
    background: #f5f4f1;
    border-bottom: 1px solid #dddbd6;
  }

  .focus-page-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 32px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    gap: 24px;
    align-items: start;
  }

  .focus-page-main {
    display: grid;
    gap: 20px;
  }

  .focus-page-aside {
    display: grid;
    gap: 20px;
    position: sticky;
    top: 0;
  }

  .focus-active-hero {
    display: grid;
    gap: 12px;
    border: 0.5px solid #dddbd6;
    border-radius: 8px;
    background: #faf9f7;
    padding: 24px;
  }

  .focus-active-hero__eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .focus-active-hero__time {
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 4rem;
    font-style: italic;
    line-height: 1;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .focus-active-hero__bar {
    overflow: hidden;
    height: 6px;
    border-radius: 999px;
    background: #e8e6e2;
  }

  .focus-active-hero__bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #1a1a1a;
    transition: width 1s linear;
  }

  .focus-active-hero__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .focus-section-card {
    border: 0.5px solid #dddbd6;
    border-radius: 8px;
    background: #faf9f7;
    overflow: hidden;
  }

  .focus-section-card__header {
    padding: 14px 18px;
    border-bottom: 0.5px solid #dddbd6;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .focus-section-card__body {
    padding: 16px 18px;
    display: grid;
    gap: 10px;
  }

  .focus-page-block-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px 18px;
    border-bottom: 0.5px solid #dddbd6;
  }

  .focus-page-block-summary span {
    border: 0.5px solid #dddbd6;
    border-radius: 999px;
    background: #fff;
    color: #555;
    padding: 5px 10px;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .focus-page-step {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 12px;
    border: 0.5px solid #dddbd6;
    border-radius: 6px;
    background: #fff;
  }

  .focus-page-step__num {
    display: inline-grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border-radius: 50%;
    background: #e8e6e2;
    color: #555;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    font-weight: 700;
  }

  .focus-page-step strong {
    display: block;
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 0.95rem;
    font-style: italic;
    color: #1a1a1a;
    margin-bottom: 3px;
  }

  .focus-page-step p {
    margin: 0;
    color: #888;
    line-height: 1.45;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
  }

  .focus-page-task {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 14px;
    border: 0.5px solid #dddbd6;
    border-radius: 6px;
    background: #fff;
  }

  .focus-page-task__check {
    display: inline-grid;
    width: 26px;
    height: 26px;
    min-height: 26px;
    place-items: center;
    border: 2px solid #1a1a1a;
    border-radius: 50%;
    background: #fff;
    color: #1a1a1a;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
  }

  .focus-page-task__check.is-complete {
    background: #1a1a1a;
    color: #f5f4f1;
    cursor: default;
  }

  .focus-page-task strong {
    display: block;
    font-family: 'Inria Serif', Georgia, serif;
    font-style: italic;
    font-size: 1rem;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .focus-page-task p {
    margin: 0;
    color: #888;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
  }

  .focus-page-task__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .focus-page-task.is-complete {
    opacity: 0.55;
  }

  .focus-page-rec {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 14px;
    border: 0.5px solid #dddbd6;
    border-radius: 6px;
    background: #fff;
  }

  .focus-page-rec__rank {
    display: inline-grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border-radius: 50%;
    background: #1a1a1a;
    color: #f5f4f1;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    font-weight: 700;
  }

  .focus-page-rec strong {
    display: block;
    font-family: 'Inria Serif', Georgia, serif;
    font-style: italic;
    font-size: 1rem;
    color: #1a1a1a;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .focus-page-rec p {
    margin: 0;
    color: #888;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
  }

  .focus-page-rec__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .focus-support-card {
    border: 0.5px solid #dddbd6;
    border-radius: 6px;
    background: #fff;
    padding: 14px;
  }

  .focus-support-card strong {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
  }

  .focus-support-card button {
    display: block;
    width: 100%;
    background: transparent;
    border: 0;
    color: #555;
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    text-align: left;
    padding: 5px 0;
    min-height: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 0.5px solid #eeecea;
    border-radius: 0;
    text-transform: none;
  }

  .focus-support-card button:last-child {
    border-bottom: 0;
  }

  .focus-support-card button:hover {
    color: #1a1a1a;
  }

  .focus-empty {
    display: grid;
    place-items: center;
    gap: 12px;
    padding: 64px 32px;
    text-align: center;
    border: 0.5px dashed #dddbd6;
    border-radius: 8px;
  }

  .focus-empty strong {
    font-family: 'Inria Serif', Georgia, serif;
    font-style: italic;
    font-size: 1.4rem;
    color: #1a1a1a;
  }

  .focus-empty p {
    margin: 0;
    color: #888;
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.06em;
    line-height: 1.6;
  }

  .focus-page-prepare-btn {
    width: 100%;
    background: #1a1a1a !important;
    color: #f5f4f1 !important;
    border: none;
    border-radius: 4px;
    padding: 14px;
    font-family: 'Geist Mono', monospace !important;
    font-size: 0.65rem !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    cursor: pointer;
    min-height: auto;
  }

  .focus-page-prepare-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .focus-page-body {
      grid-template-columns: 1fr;
      padding: 20px;
    }
    .focus-page-aside {
      position: static;
    }
  }
`

function FocusPage() {
  const [recommendedBlock, setRecommendedBlock] = useState(null)
  const [recommendedTodos, setRecommendedTodos] = useState([])

  useEffect(() => {
    getFocusRecommendations().then((data) => {
      setRecommendedBlock(data.recommended_block || null)
      setRecommendedTodos(data.recommended_todos || [])
    }).catch(() => {})
  }, [])

  const {
    activeSession,
    availableTodos,
    completeTodo,
    downloadSupportResource,
    endFocus,
    focusError,
    isExpired,
    openPrepareFocus,
    openSupportNote,
    progress,
    remainingSeconds,
    supportContext,
  } = useFocusSession()

  const recommendations = (recommendedTodos || []).slice(0, 3)
  const studyBlock = recommendedBlock || null
  const blockTodos = studyBlock?.todos?.length ? studyBlock.todos : recommendations
  const progressPercent = Math.round((Number(progress) || 0) * 100)
  const sessionTodos = activeSession?.todos || []

  return (
    <>
      <style>{styles}</style>
      <main className="focus-page">
        <ProtectedTopbar
          backLabel="Dashboard"
          backTo="/dashboard"
          className="focus-page-topbar"
          title="Focus Session"
        />

        <FeedbackBanner error={focusError} message="" />

        <div className="focus-page-body">
          <div className="focus-page-main">
            {activeSession ? (
              <>
                <div className="focus-active-hero">
                  <span className="focus-active-hero__eyebrow">
                    {isExpired ? "Time's up" : 'Now focusing'}
                  </span>
                  <div className="focus-active-hero__time">
                    {formatCountdown(remainingSeconds)}
                  </div>
                  <p style={{ margin: 0, fontFamily: 'Geist Mono, monospace', fontSize: '0.65rem', color: '#888', letterSpacing: '0.06em' }}>
                    {activeSession.title || 'Focus block'} — {sessionTodos.filter((t) => t.is_completed === 1).length} of {sessionTodos.length} tasks complete
                  </p>
                  <div className="focus-active-hero__bar">
                    <span style={{ width: `${progressPercent}%` }} />
                  </div>
                  {activeSession.session_notes && (
                    <p style={{ margin: 0, fontFamily: 'Geist Mono, monospace', fontSize: '0.65rem', color: '#555', letterSpacing: '0.04em', fontStyle: 'italic' }}>
                      {activeSession.session_notes}
                    </p>
                  )}
                  <div className="focus-active-hero__actions">
                    <button
                      className="focus-page-prepare-btn"
                      onClick={() => endFocus(activeSession.id)}
                      style={{ width: 'auto', padding: '10px 20px' }}
                      type="button"
                    >
                      {isExpired ? 'Finish Session' : 'End Session'}
                    </button>
                  </div>
                </div>

                <div className="focus-section-card">
                  <div className="focus-section-card__header">Tasks in this block</div>
                  <div className="focus-section-card__body">
                    {sessionTodos.map((todo, i) => {
                      const isComplete = todo.is_completed === 1
                      const priority = getPriorityMeta(todo)
                      const load = getLoadMeta(todo)
                      return (
                        <div className={isComplete ? 'focus-page-task is-complete' : 'focus-page-task'} key={todo.id}>
                          <button
                            className={isComplete ? 'focus-page-task__check is-complete' : 'focus-page-task__check'}
                            disabled={isComplete}
                            onClick={() => completeTodo(todo.id)}
                            type="button"
                          >
                            {i + 1}
                          </button>
                          <div>
                            <strong>{todo.title}</strong>
                            <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                            <div className="focus-page-task__badges">
                              <span className={`priority-badge priority-badge--${priority.tone}`}>
                                {priority.label} {formatBhpsScore(todo)}
                              </span>
                              <span className={`load-badge load-badge--${load.tone}`}>
                                {load.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {blockTodos.length > 0 ? (
                  <>
                    <div className="focus-section-card">
                      <div className="focus-page-block-summary">
                        <span>{studyBlock?.duration_minutes || 50} min</span>
                        <span>{studyBlock?.cognitive_load || 'Moderate'} load</span>
                        <span>{studyBlock?.topic?.title || 'Today'}</span>
                      </div>
                      <div className="focus-section-card__body">
                        <div>
                          <strong style={{ fontFamily: 'Inria Serif, serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#1a1a1a', display: 'block', marginBottom: '8px' }}>
                            {studyBlock?.title || `Start with ${blockTodos[0].title}`}
                          </strong>
                          <p style={{ margin: 0, fontFamily: 'Geist Mono, monospace', fontSize: '0.62rem', color: '#888', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                            {studyBlock?.reason || 'BHPS picked this because it has the highest priority score.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {studyBlock?.steps?.length > 0 && (
                      <div className="focus-section-card">
                        <div className="focus-section-card__header">Recommended steps</div>
                        <div className="focus-section-card__body">
                          {studyBlock.steps.map((step, i) => (
                            <div className="focus-page-step" key={step.key || i}>
                              <span className="focus-page-step__num">{i + 1}</span>
                              <div>
                                <strong>{step.title}</strong>
                                <p>{step.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="focus-section-card">
                      <div className="focus-section-card__header">Tasks in this block</div>
                      <div className="focus-section-card__body">
                        {blockTodos.map((todo, i) => {
                          const priority = getPriorityMeta(todo)
                          const load = getLoadMeta(todo)
                          return (
                            <div className="focus-page-rec" key={todo.id}>
                              <span className="focus-page-rec__rank">{i + 1}</span>
                              <div>
                                <strong>{todo.title}</strong>
                                <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                                <div className="focus-page-rec__badges">
                                  <span className={`priority-badge priority-badge--${priority.tone}`}>
                                    {priority.label} {formatBhpsScore(todo)}
                                  </span>
                                  <span className={`load-badge load-badge--${load.tone}`}>
                                    {load.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="focus-empty">
                    <strong>No recommendations yet</strong>
                    <p>Add active tasks with deadlines and effort estimates to unlock BHPS recommendations.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="focus-page-aside">
            {!activeSession && (
              <button
                className="focus-page-prepare-btn"
                disabled={blockTodos.length === 0}
                onClick={() => openPrepareFocus({
                  duration_minutes: studyBlock?.duration_minutes || 50,
                  reason: studyBlock?.reason || '',
                  title: studyBlock?.title || '',
                  todos: blockTodos,
                })}
                type="button"
              >
                Prepare Focus
              </button>
            )}

            {supportContext.notes?.length > 0 && (
              <div className="focus-support-card">
                <strong>Notes</strong>
                {supportContext.notes.map((note) => (
                  <button key={note.id} onClick={() => openSupportNote(note)} type="button">
                    {note.title}
                  </button>
                ))}
              </div>
            )}

            {supportContext.resources?.length > 0 && (
              <div className="focus-support-card">
                <strong>Resources</strong>
                {supportContext.resources.map((resource) => (
                  <button key={resource.id} onClick={() => downloadSupportResource(resource)} type="button">
                    {resource.original_name}
                  </button>
                ))}
              </div>
            )}

            {!activeSession && availableTodos.length > 0 && (
              <div className="focus-section-card">
                <div className="focus-section-card__header">All available tasks</div>
                <div className="focus-section-card__body" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {availableTodos.filter((t) => t.is_completed !== 1).map((todo) => {
                    const priority = getPriorityMeta(todo)
                    return (
                      <div
                        key={todo.id}
                        style={{
                          padding: '10px 12px',
                          border: '0.5px solid #dddbd6',
                          borderRadius: '6px',
                          background: '#fff',
                          marginBottom: '8px',
                        }}
                      >
                        <p style={{ margin: '0 0 4px', fontFamily: 'Inria Serif, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {todo.title}
                        </p>
                        <span className={`priority-badge priority-badge--${priority.tone}`}>
                          {priority.label} {formatBhpsScore(todo)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default FocusPage