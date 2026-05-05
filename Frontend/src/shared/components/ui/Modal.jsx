import { useEffect, useId } from 'react'
import { CloseIcon } from './Icons'

function Modal({ children, isOpen, onClose, size = 'default', title }) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`modal-content modal-content--${size}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            aria-label={`Close ${title}`}
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="ui-icon" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
