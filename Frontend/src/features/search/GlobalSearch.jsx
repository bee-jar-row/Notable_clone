import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../../shared/components/ui/Modal'
import { SearchIcon } from '../../shared/components/ui/Icons'
import { formatBhpsScore, getFocusCue, getPriorityMeta } from '../../utils/priority'
import { formatTime } from '../../utils/date'
import { downloadSearchResource, globalSearch } from './search.api'

const EMPTY_RESULTS = {
  workspace: [],
  tasks: [],
  notes: [],
  chapters: [],
  resources: [],
  recommendations: [],
}

function totalResults(results) {
  return Object.keys(EMPTY_RESULTS).reduce((total, key) => total + (results[key]?.length || 0), 0)
}

function taskTarget(todo) {
  if (todo.notebook_id) return `/notebook/${todo.notebook_id}`
  if (todo.folder_id) return `/folder/${todo.folder_id}`
  return '/dashboard'
}

function resourceTarget(resource) {
  if (resource.chapter_id && resource.notebook_id) {
    return `/notebook/${resource.notebook_id}/chapter/${resource.chapter_id}/edit`
  }
  if (resource.notebook_id) return `/notebook/${resource.notebook_id}`
  return '/dashboard'
}

function workspaceTarget(item) {
  return item.type === 'folder' ? `/folder/${item.id}` : `/notebook/${item.id}`
}

function PriorityBadge({ todo }) {
  const priority = getPriorityMeta(todo)
  return (
    <span className={`priority-badge priority-badge--${priority.tone}`}>
      {priority.label} / {formatBhpsScore(todo)}
    </span>
  )
}

function EmptySearchState({ query }) {
  if (!query.trim()) {
    return (
      <div className="global-search-empty">
        <strong>Search across Notable</strong>
        <p>Try a task, note, chapter, resource, folder, or notebook title.</p>
      </div>
    )
  }

  return (
    <div className="global-search-empty">
      <strong>No result for "{query}"</strong>
      <p>Try a course name, resource filename, or task keyword.</p>
    </div>
  )
}

function SearchSection({ children, count, title }) {
  if (!count) return null
  return (
    <section className="global-search-section">
      <div className="global-search-section__header">
        <h3>{title}</h3>
        <span>{count}</span>
      </div>
      <div className="global-search-results">
        {children}
      </div>
    </section>
  )
}

function GlobalSearch({ className = 'dashboard-search' }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(EMPTY_RESULTS)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return undefined

    let ignore = false

    const timer = window.setTimeout(async () => {
      try {
        const data = await globalSearch(trimmedQuery)
        if (!ignore) setResults({ ...EMPTY_RESULTS, ...data })
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }, 180)

    return () => {
      ignore = true
      window.clearTimeout(timer)
    }
  }, [isOpen, query])

  const count = useMemo(() => totalResults(results), [results])

  function updateQuery(value) {
    setQuery(value)
    if (!value.trim()) {
      setResults(EMPTY_RESULTS)
      setError('')
      setIsLoading(false)
    } else {
      setError('')
      setIsLoading(true)
    }
  }

  function openWithQuery(value = query) {
    updateQuery(value)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  function goTo(path) {
    close()
    navigate(path)
  }

  async function downloadResource(resource) {
    setError('')
    try {
      await downloadSearchResource(resource.id, resource.original_name)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className={className}>
        <SearchIcon className="ui-icon search-input__icon" />
        <input
          aria-label="Global search"
          onChange={(event) => openWithQuery(event.target.value)}
          onFocus={() => openWithQuery()}
          placeholder="Search"
          value={query}
        />
      </div>

      <Modal isOpen={isOpen} onClose={close} size="wide" title="Search Notable">
        <div className="global-search">
          <label className="global-search-input">
            <SearchIcon className="ui-icon" />
            <input
              aria-label="Search folders, notebooks, tasks, notes, chapters, and resources"
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search thesis, HCI, pdf, feedback..."
              ref={inputRef}
              value={query}
            />
          </label>

          {error && <div className="feedback-banner feedback-banner--error">{error}</div>}
          {isLoading && <p className="muted global-search-status">Searching...</p>}
          {!isLoading && !error && count === 0 && <EmptySearchState query={query} />}

          {!isLoading && count > 0 && (
            <div className="global-search-layout">
              <div className="global-search-main">
                <SearchSection count={results.workspace.length} title="Workspace">
                  {results.workspace.map((item) => (
                    <Link className="global-search-item" key={`${item.type}-${item.id}`} onClick={close} to={workspaceTarget(item)}>
                      <span className="global-search-item__type">{item.type}</span>
                      <strong>{item.title}</strong>
                      <p>{item.subtitle}</p>
                    </Link>
                  ))}
                </SearchSection>

                <SearchSection count={results.tasks.length} title="Tasks">
                  {results.tasks.map((todo) => (
                    <button className="global-search-item global-search-item--button" key={todo.id} onClick={() => goTo(taskTarget(todo))} type="button">
                      <span className="global-search-item__type">task</span>
                      <strong>{todo.title}</strong>
                      <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                      <PriorityBadge todo={todo} />
                    </button>
                  ))}
                </SearchSection>

                <SearchSection count={results.chapters.length} title="Chapters">
                  {results.chapters.map((chapter) => (
                    <Link className="global-search-item" key={chapter.id} onClick={close} to={`/notebook/${chapter.notebook_id}/chapter/${chapter.id}/edit`}>
                      <span className="global-search-item__type">chapter</span>
                      <strong>{chapter.title}</strong>
                      <p>{chapter.excerpt || chapter.notebook_title || 'Chapter content'}</p>
                    </Link>
                  ))}
                </SearchSection>

                <SearchSection count={results.notes.length} title="Notes">
                  {results.notes.map((note) => (
                    <button className="global-search-item global-search-item--button" key={note.id} onClick={() => goTo(taskTarget(note))} type="button">
                      <span className="global-search-item__type">note</span>
                      <strong>{note.title}</strong>
                      <p>{note.excerpt || note.todo_title || 'Linked note'}</p>
                    </button>
                  ))}
                </SearchSection>

                <SearchSection count={results.resources.length} title="Resources">
                  {results.resources.map((resource) => (
                    <article className="global-search-item global-search-resource" key={resource.id}>
                      <button className="global-search-item__content" onClick={() => goTo(resourceTarget(resource))} type="button">
                        <span className="global-search-item__type">resource</span>
                        <strong>{resource.original_name}</strong>
                        <p>{resource.chapter_title || resource.notebook_title || 'Uploaded resource'}</p>
                      </button>
                      <button className="ghost-button ghost-button--small" onClick={() => downloadResource(resource)} type="button">
                        Download
                      </button>
                    </article>
                  ))}
                </SearchSection>
              </div>

              <aside className="global-search-recommendations">
                <div className="global-search-section__header">
                  <h3>Recommended next</h3>
                  <span>{results.recommendations.length}</span>
                </div>
                {results.recommendations.map((todo) => (
                  <button className="global-search-recommendation" key={todo.id} onClick={() => goTo(taskTarget(todo))} type="button">
                    <strong>{todo.title}</strong>
                    <p>{formatTime(todo.deadline)} / {getFocusCue(todo)}</p>
                    <PriorityBadge todo={todo} />
                  </button>
                ))}
              </aside>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default GlobalSearch
