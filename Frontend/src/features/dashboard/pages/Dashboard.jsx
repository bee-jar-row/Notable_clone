import { useAuth } from '../../../app/providers/AuthContext'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import { useFocusSession } from '../../focus/FocusSessionContext'
import CalendarPanel from '../components/CalendarPanel'
import DashboardHeader from '../components/DashboardHeader'
import DashboardModals from '../components/DashboardModals'
import FocusPanel from '../components/FocusPanel'
import RemindersPanel from '../components/RemindersPanel'
import TimelinePanel from '../components/TimelinePanel'
import WorkspaceGrid from '../components/WorkspaceGrid'
import { useDashboard } from '../hooks/useDashboard'

const styles = `
  .dashboard-page {
    min-height: 100vh;
    background: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    flex: 1;
    min-height: 0;
  }

  .dashboard-sidebar {
    border-left: 1px solid #dddbd6;
    background: #faf9f7;
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
              <FocusPanel
                activeSession={focus.activeSession}
                isExpired={focus.isExpired}
                onCompleteTodo={focus.completeTodo}
                onDownloadSupportResource={focus.downloadSupportResource}
                onEndFocus={focus.endFocus}
                onOpenFocus={focus.openOverlay}
                onOpenSupportNote={focus.openSupportNote}
                onPrepareFocus={focus.openPrepareFocus}
                progress={focus.progress}
                recommendedBlock={data.recommendedBlock}
                recommendedTodos={data.recommendedTodos}
                remainingSeconds={focus.remainingSeconds}
              />
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
