import { Link } from 'react-router-dom'
import { formatShortDate } from '../../../utils/date'

function ChapterList({ chapters, navigationState, notebookId, onDeleteChapter }) {
  if (chapters.length === 0) {
    return <p className="muted">No chapters found.</p>
  }

  return chapters.map((chapter) => (
    <article className="chapter-card-new" key={chapter.id}>
      <div className="chapter-card-new__header">
        <Link
          className="chapter-card-new__link"
          state={navigationState}
          to={`/notebook/${notebookId}/chapter/${chapter.id}/edit`}
        >
          <h3>{chapter.title}</h3>
        </Link>
        <div className="chapter-card-new__actions">
          <Link
            className="chapter-action"
            aria-label={`Edit ${chapter.title}`}
            state={navigationState}
            to={`/notebook/${notebookId}/chapter/${chapter.id}/edit`}
          >
            Edit
          </Link>
          <button
            aria-label={`Delete ${chapter.title}`}
            className="chapter-action"
            onClick={() => onDeleteChapter(chapter.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
      <Link
        className="chapter-card-new__body-link"
        state={navigationState}
        to={`/notebook/${notebookId}/chapter/${chapter.id}/edit`}
      >
        <p>{chapter.content || 'No content yet.'}</p>
      </Link>
      <div className="chapter-meta">Created On: {formatShortDate(chapter.created_at)}</div>
    </article>
  ))
}

export default ChapterList
