import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import ChapterList from '../components/ChapterList'
import NotebookModals from '../components/NotebookModals'
import NotebookTimelinePanel from '../components/NotebookTimelinePanel'
import NotebookTopbar from '../components/NotebookTopbar'
import NotesPanel from '../components/NotesPanel'
import ResourcesPanel from '../components/ResourcesPanel'
import { useNotebook } from '../hooks/useNotebook'

function Notebook() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const fromFolder = location.state?.fromFolder || null
  const backTo = fromFolder?.id ? `/folder/${fromFolder.id}` : '/dashboard'
  const backLabel = fromFolder?.title || 'Dashboard'
  const notebookState = useMemo(() => (
    fromFolder ? { fromFolder } : { fromDashboard: true }
  ), [fromFolder])
  const onMissingNotebook = useCallback(() => {
    navigate('/dashboard', { replace: true })
  }, [navigate])
  const onChapterCreated = useCallback((chapterId) => {
    navigate(`/notebook/${id}/chapter/${chapterId}/edit`, { state: notebookState })
  }, [id, navigate, notebookState])
  const notebook = useNotebook({ id, onChapterCreated, onMissingNotebook })
  const {
    activeModal,
    chapterForm,
    chapters,
    closeModal,
    completeTodo,
    deleteChapter,
    deleteNote,
    deleteResource,
    deleteTodo,
    download,
    editingNoteId,
    error,
    filteredChapters,
    groupedTodos,
    isLoading,
    message,
    noteForm,
    notes,
    notebook: notebookData,
    openModal,
    openEditNote,
    resourceForm,
    resources,
    search,
    setChapterForm,
    setNoteForm,
    setResourceForm,
    setSearch,
    setTodoForm,
    submitChapter,
    submitNote,
    submitResource,
    submitTodo,
    todoForm,
    todos,
  } = notebook

  return (
    <div className="notebook-page">
      <NotebookTopbar
        backLabel={backLabel}
        backState={notebookState}
        backTo={backTo}
        notebook={notebookData}
        onOpenModal={openModal}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch('')}
        search={search}
      />

      <FeedbackBanner className="notebook-feedback" error={error} message={message} />

      {isLoading ? (
        <div className="notebook-loading">Loading notebook...</div>
      ) : (
        <div className="notebook-layout-new">
          <div>
            <NotebookTimelinePanel
              groupedTodos={groupedTodos}
              notebookTitle={notebookData?.title}
              onCompleteTodo={completeTodo}
              onDeleteTodo={deleteTodo}
              onOpenModal={openModal}
            />
            <NotesPanel
              onDeleteNote={deleteNote}
              onEditNote={openEditNote}
              notes={notes}
              onOpenModal={openModal}
            />
            <ResourcesPanel
              onDeleteResource={deleteResource}
              onDownload={download}
              onOpenModal={openModal}
              resources={resources}
            />
          </div>

          <div>
            <ChapterList
              chapters={filteredChapters}
              navigationState={notebookState}
              notebookId={id}
              onDeleteChapter={deleteChapter}
            />
          </div>
        </div>
      )}

      <NotebookModals
        activeModal={activeModal}
        chapterForm={chapterForm}
        chapters={chapters}
        noteForm={noteForm}
        editingNoteId={editingNoteId}
        onChapterFormChange={setChapterForm}
        onClose={closeModal}
        onNoteFormChange={setNoteForm}
        onResourceFormChange={setResourceForm}
        onSubmitChapter={submitChapter}
        onSubmitNote={submitNote}
        onSubmitResource={submitResource}
        onSubmitTodo={submitTodo}
        onTodoFormChange={setTodoForm}
        resourceForm={resourceForm}
        todoForm={todoForm}
        todos={todos}
      />
    </div>
  )
}

export default Notebook
