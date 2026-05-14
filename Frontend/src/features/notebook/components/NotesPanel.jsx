import { formatShortDate } from '../../../utils/date'
import { NOTEBOOK_MODAL } from '../hooks/useNotebook'

function NotesPanel({ notes, onDeleteNote, onEditNote, onOpenModal }) {
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
              <div className="note-row__footer">
                <span>Updated {formatShortDate(note.updated_at || note.created_at)}</span>
                <div className="note-row__actions">
                  <button
                    className="ghost-button ghost-button--small"
                    onClick={() => onEditNote(note)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="pill-card__delete"
                    onClick={() => onDeleteNote(note.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotesPanel
