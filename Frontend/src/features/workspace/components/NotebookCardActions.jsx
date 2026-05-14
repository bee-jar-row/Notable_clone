import ActionPopover from '../../../shared/components/ui/ActionPopover'
import { MoreIcon } from '../../../shared/components/ui/Icons'

function NotebookCardActions({ notebook, onDelete, onEditCover }) {
  return (
    <ActionPopover
      ariaLabel={`Notebook actions for ${notebook.title}`}
      buttonClassName="workspace-item__menu-button"
      icon={<MoreIcon className="ui-icon" />}
    >
      <div className="dashboard-menu__section workspace-item__menu-section">
        <button onClick={() => onEditCover(notebook)} role="menuitem" type="button">
          Edit Cover
        </button>
        <button
          className="workspace-item__menu-danger"
          onClick={() => onDelete(notebook.id)}
          role="menuitem"
          type="button"
        >
          Delete
        </button>
      </div>
    </ActionPopover>
  )
}

export default NotebookCardActions
