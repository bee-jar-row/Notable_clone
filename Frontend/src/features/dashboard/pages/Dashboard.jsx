import { Link } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import { formatCountdown, useFocusSession } from '../../focus/FocusSessionContext'
import CalendarPanel from '../components/CalendarPanel'
import DashboardHeader from '../components/DashboardHeader'
import DashboardModals from '../components/DashboardModals'
import RemindersPanel from '../components/RemindersPanel'
import TimelinePanel from '../components/TimelinePanel'
import WorkspaceGrid from '../components/WorkspaceGrid'
import { useDashboard } from '../hooks/useDashboard'

const styles = `
  .dashboard-page {
    background: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    flex: 1;
    height: calc(100vh - 57px);
    overflow: hidden;
  }

  .dashboard-sidebar {
    border-left: 1px solid #dddbd6;
    background: #faf9f7;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .dashboard-loading {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #aaa;
    padding: 64px 48px;
    text-align: center;
  }
`

function FocusMiniPanel({ focus }) {
  if (focus.activeSession) {
    return (
      <aside className="dashboard-panel" style={{ flexShrink: 0 }}>
        <div className="dashboard-panel__header">
          <h2>Focus Session</h2>
          <Link
            to="/focus"
            style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', textDecoration: 'none' }}
          >
            Open →
          </Link>
        </div>
        <div className="dashboard-panel__body" style={{ padding: '14px 16px', display: 'grid', gap: '10px' }}>
          <div style={{ fontFamily: 'Inria Serif, serif', fontStyle: 'italic', fontSize: '2rem', color: '#1a1a1a', lineHeight: 1 }}>
            {formatCountdown(focus.remainingSeconds)}
          </div>
          <p style={{ margin: 0, fontFamily: 'Geist Mono, monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {focus.activeSession.todos?.find((t) => t.is_completed !== 1)?.title || focus.activeSession.title || 'Focus block running'}
          </p>
          <div style={{ overflow: 'hidden', height: '4px', borderRadius: '999px', background: '#e8e6e2' }}>
            <div style={{ height: '100%', width: `${Math.round(focus.progress * 100)}%`, background: '#1a1a1a', borderRadius: 'inherit', transition: 'width 1s linear' }} />
          </div>
          <button
            onClick={() => focus.endFocus(focus.activeSession.id)}
            style={{ minHeight: 'auto', padding: '8px', fontSize: '10px' }}
            type="button"
          >
            End Session
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="dashboard-panel" style={{ flexShrink: 0 }}>
      <div className="dashboard-panel__header">
        <h2>Focus Session</h2>
      </div>
      <div className="dashboard-panel__body" style={{ padding: '14px 16px' }}>
        <p className="muted" style={{ fontSize: '12px', marginBottom: '10px' }}>No active session.</p>
        <Link
          to="/focus"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '8px',
            background: '#1a1a1a',
            color: '#f5f4f1',
            borderRadius: '4px',
            fontFamily: 'Geist Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Go to Focus →
        </Link>
      </div>
    </aside>
  )
}

function Dashboard() {
  const auth = useAuth()
  const focus = useFocusSession()
  const dashboard = useDashboard(auth)
  const {
    activeModal,
    closeModal,
    completeTodo,
    data,
    deleteNotebook,
    deleteTodo,
    editingNotebook,
    error,
    folderTitle,
    isLoading,
    message,
    notebookTitle,
    notebookCover,
    openModal,
    openNotebookCoverModal,
    selectedFolder,
    reminderTodos,
    setFolderTitle,
    setNotebookTitle,
    setNotebookCover,
    setSelectedFolder,
    setSortMode,
    setStatusFilter,
    setTodoForm,
    setTypeFilter,
    sortMode,
    statusFilter,
    submitFolder,
    submitNotebook,
    submitNotebookCover,
    submitTodo,
    todoForm,
    typeFilter,
    visibleTimelineTodos,
    visibleWorkspaceItems,
  } = dashboard

  return (
    <>
      <style>{styles}</style>
      <main className="app-shell dashboard-page">
        <DashboardHeader
          onSortModeChange={setSortMode}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          profile={data.profile}
          sortMode={sortMode}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
        />
        <FeedbackBanner error={error} message={message} />

        {isLoading ? (
          <div className="dashboard-loading">Loading workspace…</div>
        ) : (
          <div className="dashboard-grid">
            <WorkspaceGrid
              onEditNotebookCover={openNotebookCoverModal}
              onDeleteNotebook={deleteNotebook}
              onOpenModal={openModal}
              workspaceItems={visibleWorkspaceItems}
            />
            <div className="dashboard-sidebar">
              <CalendarPanel
                activeModal={activeModal}
                onCloseModal={closeModal}
                onOpenModal={openModal}
                profile={data.profile}
              />
              <RemindersPanel reminders={reminderTodos} />
              <TimelinePanel
                onCompleteTodo={completeTodo}
                onDeleteTodo={deleteTodo}
                onOpenModal={openModal}
                todos={visibleTimelineTodos}
              />
              <FocusMiniPanel focus={focus} />
            </div>
            </div>
        )}

        <DashboardModals
          activeModal={activeModal}
          editingNotebook={editingNotebook}
          folderTitle={folderTitle}
          folders={data.folders}
          notebooks={data.notebooks}
          notebookTitle={notebookTitle}
          notebookCover={notebookCover}
          onClose={closeModal}
          onFolderTitleChange={setFolderTitle}
          onNotebookTitleChange={setNotebookTitle}
          onNotebookCoverChange={setNotebookCover}
          onSelectedFolderChange={setSelectedFolder}
          onSubmitFolder={submitFolder}
          onSubmitNotebook={submitNotebook}
          onSubmitNotebookCover={submitNotebookCover}
          onSubmitTodo={submitTodo}
          onTodoFormChange={setTodoForm}
          selectedFolder={selectedFolder}
          todoForm={todoForm}
        />
      </main>
    </>
  )
}

export default Dashboard