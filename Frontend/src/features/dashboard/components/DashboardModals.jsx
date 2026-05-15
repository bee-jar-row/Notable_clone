import Modal from '../../../shared/components/ui/Modal'
import { getDefaultReminderAt } from '../../../utils/reminders'
import { DASHBOARD_MODAL } from '../hooks/useDashboard'

function DashboardModals({
  activeModal,
  folderTitle,
  folders,
  notebooks,
  notebookTitle,
  onClose,
  onFolderTitleChange,
  onNotebookTitleChange,
  onSelectedFolderChange,
  onSubmitFolder,
  onSubmitNotebook,
  onSubmitTodo,
  onTodoFormChange,
  selectedFolder,
  todoForm,
}) {
  function handleTodoTargetChange(value) {
    if (value === '') {
      onTodoFormChange({ ...todoForm, folder_id: '', notebook_id: '' })
      return
    }

    const [type, id] = value.split(':')
    onTodoFormChange({
      ...todoForm,
      folder_id: type === 'folder' ? id : '',
      notebook_id: type === 'notebook' ? id : '',
    })
  }

  const todoTargetValue = todoForm.notebook_id
    ? `notebook:${todoForm.notebook_id}`
    : todoForm.folder_id
      ? `folder:${todoForm.folder_id}`
      : ''

  function handleDeadlineChange(value) {
    onTodoFormChange({
      ...todoForm,
      deadline: value,
      reminder_at: todoForm.reminder_at || getDefaultReminderAt(value),
    })
  }

  return (
    <>
      <Modal
        isOpen={activeModal === DASHBOARD_MODAL.FOLDER}
        onClose={onClose}
        size="dialog"
        title="Create Folder"
      >
        <form className="stack modal-form" onSubmit={onSubmitFolder}>
          <label className="auth-form-label">
            Folder title
            <input
              className="auth-form-input"
              onChange={(event) => onFolderTitleChange(event.target.value)}
              required
              value={folderTitle}
            />
          </label>
          <button className="auth-submit-btn" type="submit">Create Folder</button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === DASHBOARD_MODAL.NOTEBOOK}
        onClose={onClose}
        size="dialog"
        title="Create Notebook"
      >
        <form className="stack modal-form" onSubmit={onSubmitNotebook}>
          <label className="auth-form-label">
            Notebook title
            <input
              className="auth-form-input"
              onChange={(event) => onNotebookTitleChange(event.target.value)}
              required
              value={notebookTitle}
            />
          </label>
          <label className="auth-form-label">
            Folder
            <select
              className="auth-form-input"
              onChange={(event) => onSelectedFolderChange(event.target.value)}
              value={selectedFolder}
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.title}</option>
              ))}
            </select>
          </label>
          <button className="auth-submit-btn" type="submit">Create Notebook</button>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === DASHBOARD_MODAL.TODO}
        onClose={onClose}
        size="dialog"
        title="Create Todo"
      >
        <form className="stack modal-form" onSubmit={onSubmitTodo}>
          <label className="auth-form-label">
            Task title
            <input
              className="auth-form-input"
              onChange={(event) => onTodoFormChange({ ...todoForm, title: event.target.value })}
              required
              value={todoForm.title}
            />
          </label>
          <label className="auth-form-label">
            Deadline
            <input
              className="auth-form-input"
              onChange={(event) => handleDeadlineChange(event.target.value)}
              required
              type="datetime-local"
              value={todoForm.deadline}
            />
          </label>
          <label className="auth-form-label">
            Reminder
            <input
              className="auth-form-input"
              onChange={(event) => onTodoFormChange({ ...todoForm, reminder_at: event.target.value })}
              type="datetime-local"
              value={todoForm.reminder_at}
            />
          </label>
          <label className="auth-form-label">
            Assign to
            <select className="auth-form-input" onChange={(event) => handleTodoTargetChange(event.target.value)} value={todoTargetValue}>
              <option value="">Unassigned</option>
              {folders.length > 0 && (
                <optgroup label="Folders">
                  {folders.map((folder) => (
                    <option key={folder.id} value={`folder:${folder.id}`}>{folder.title}</option>
                  ))}
                </optgroup>
              )}
              {notebooks.length > 0 && (
                <optgroup label="Notebooks">
                  {notebooks.map((notebook) => (
                    <option key={notebook.id} value={`notebook:${notebook.id}`}>{notebook.title}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className="auth-form-label">
            Weight (1-10)
            <input
              className="auth-form-input"
              max="10"
              min="1"
              onChange={(event) => onTodoFormChange({ ...todoForm, academic_weight: event.target.value })}
              required
              type="number"
              value={todoForm.academic_weight}
            />
          </label>
          <label className="auth-form-label">
            Effort (1-10)
            <input
              className="auth-form-input"
              max="10"
              min="1"
              onChange={(event) => onTodoFormChange({ ...todoForm, estimated_effort: event.target.value })}
              required
              type="number"
              value={todoForm.estimated_effort}
            />
          </label>
          <button className="auth-submit-btn" type="submit">Create Task</button>
        </form>
      </Modal>
    </>
  )
}

export default DashboardModals
