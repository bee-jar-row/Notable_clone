import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import SearchInput from '../../../shared/components/ui/SearchInput'
import { NOTEBOOK_MODAL } from '../hooks/useNotebook'

function NotebookTopbar({
  backLabel,
  backState,
  backTo,
  notebook,
  onOpenModal,
  onSearchChange,
  onSearchClear,
  search,
}) {
  return (
    <ProtectedTopbar
      actions={(
        <>
        <SearchInput
          ariaLabel="Search chapters"
          className="notebook-search"
          onChange={onSearchChange}
          onClear={onSearchClear}
          value={search}
        />
        <button
          className="dashboard-tool-button dashboard-tool-button--text"
          onClick={() => onOpenModal(NOTEBOOK_MODAL.CHAPTER)}
          type="button"
        >
          Add Chapter
        </button>
        </>
      )}
      backLabel={backLabel}
      backState={backState}
      backTo={backTo}
      className="notebook-topbar"
      title={notebook?.title || 'Notebook Title'}
    />
  )
}

export default NotebookTopbar
