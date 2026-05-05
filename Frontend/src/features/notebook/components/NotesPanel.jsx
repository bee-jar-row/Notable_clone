import { formatShortDate } from '../../../utils/date'
import { NOTEBOOK_MODAL } from '../hooks/useNotebook'

function NotesPanel({ notes, onOpenModal }) {
  return (
    <div className="notebook-panel notebook-panel--notes">
      <div className="notebook-panel-header">
        <h2>Notes</h2>
        <button
          aria-label="Create note"
          className="plus-btn"
          onClick={() => onOpenModal(NOTEBOOK_MODAL.NOTE)}
          type="button"
        >
          +
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="muted notebook-panel__empty">No linked notes yet.</p>
      ) : (
        <div className="notebook-panel__scroller notebook-panel__scroller--notes">
          {notes.map((note) => (
            <article className="note-row" key={note.id}>
              <strong>{note.title}</strong>
              <p>{note.content}</p>
              <span>Updated {formatShortDate(note.updated_at || note.created_at)}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotesPanel
