import { NOTEBOOK_MODAL } from '../hooks/useNotebook'

function ResourcesPanel({ onDeleteResource, onDownload, onOpenModal, resources }) {
  return (
    <div className="notebook-panel">
      <div className="notebook-panel-header">
        <h2>Resources</h2>
        <button
          aria-label="Upload resource"
          className="plus-btn"
          onClick={() => onOpenModal(NOTEBOOK_MODAL.RESOURCE)}
          type="button"
        >
          +
        </button>
      </div>
      {resources.length === 0 ? (
        <p className="muted notebook-panel__empty">No resources.</p>
      ) : (
        <div className="notebook-panel__scroller notebook-panel__scroller--resources">
          {resources.map((resource) => (
            <div className="resource-row" key={resource.id}>
              <p>{resource.original_name}</p>
              <div className="resource-row__actions">
                <button
                  aria-label={`Download ${resource.original_name}`}
                  className="resource-row__action"
                  onClick={() => onDownload(resource)}
                  type="button"
                >
                  Download
                </button>
                <button
                  aria-label={`Delete ${resource.original_name}`}
                  className="resource-row__action resource-row__action--danger"
                  onClick={() => onDeleteResource(resource.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResourcesPanel
