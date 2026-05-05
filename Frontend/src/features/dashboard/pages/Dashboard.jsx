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
    error,
    folderTitle,
    isLoading,
    message,
    notebookTitle,
    openModal,
    selectedFolder,
    reminderTodos,
    setFolderTitle,
    setNotebookTitle,
    setSelectedFolder,
    setSortMode,
    setStatusFilter,
    setTodoForm,
    setTypeFilter,
    sortMode,
    statusFilter,
    submitFolder,
    submitNotebook,
    submitTodo,
    todoForm,
    typeFilter,
    visibleTimelineTodos,
    visibleWorkspaceItems,
  } = dashboard

  return (
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
        <div className="panel">Loading workspace...</div>
      ) : (
        <div className="dashboard-grid">
          <WorkspaceGrid
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
              onEndFocus={focus.endFocus}
              onOpenFocus={focus.openOverlay}
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
        folderTitle={folderTitle}
        folders={data.folders}
        notebooks={data.notebooks}
        notebookTitle={notebookTitle}
        onClose={closeModal}
        onFolderTitleChange={setFolderTitle}
        onNotebookTitleChange={setNotebookTitle}
        onSelectedFolderChange={setSelectedFolder}
        onSubmitFolder={submitFolder}
        onSubmitNotebook={submitNotebook}
        onSubmitTodo={submitTodo}
        onTodoFormChange={setTodoForm}
        selectedFolder={selectedFolder}
        todoForm={todoForm}
      />
    </main>
  )
}

export default Dashboard
