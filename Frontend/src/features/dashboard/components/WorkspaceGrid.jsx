import { Link } from 'react-router-dom'
import FolderCard from '../../workspace/components/FolderCard'
import NotebookCard from '../../workspace/components/NotebookCard'
import { DASHBOARD_MODAL } from '../hooks/useDashboard'

function WorkspaceGrid({ onDeleteNotebook, onOpenModal, workspaceItems }) {
  return (
    <section className="workspace-grid" aria-label="Workspace items">
      {workspaceItems.map((item) => (
        <div className="workspace-item" key={`${item.type}-${item.id}`}>
          {item.type === 'folder' ? (
            <Link className="workspace-item__link" to={`/folder/${item.id}`}>
              <FolderCard title={item.title} taskCount={item.taskCount} />
            </Link>
          ) : (
            <>
              <Link
                className="workspace-item__link"
                state={{ fromDashboard: true }}
                to={`/notebook/${item.id}`}
              >
                <NotebookCard title={item.title} taskCount={item.taskCount} />
              </Link>
              <button
                aria-label={`Delete notebook ${item.title}`}
                className="workspace-item__delete"
                onClick={() => onDeleteNotebook(item.id)}
                type="button"
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}

      <div className="add-card-button add-card-button--dashboard">
        <span aria-hidden="true">+</span>
        <button
          aria-label="Create folder"
          className="add-card-button__action"
          onClick={() => onOpenModal(DASHBOARD_MODAL.FOLDER)}
          type="button"
        >
          Folder
        </button>
        <button
          aria-label="Create notebook"
          className="add-card-button__action"
          onClick={() => onOpenModal(DASHBOARD_MODAL.NOTEBOOK)}
          type="button"
        >
          Notebook
        </button>
      </div>
      {workspaceItems.length === 0 && (
        <p className="muted workspace-grid__empty">No workspace items found.</p>
      )}
    </section>
  )
}

export default WorkspaceGrid
