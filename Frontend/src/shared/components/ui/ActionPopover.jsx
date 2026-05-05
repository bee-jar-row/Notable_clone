import { useEffect, useId, useRef, useState } from 'react'

function ActionPopover({ ariaLabel, buttonClassName = 'dashboard-tool-button', children, icon, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverId = useId()
  const rootRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className={isOpen ? 'dashboard-menu is-open' : 'dashboard-menu'} ref={rootRef}>
      <button
        aria-controls={popoverId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {icon}
        {label && <span>{label}</span>}
      </button>
      <div
        aria-label={ariaLabel}
        className="dashboard-menu__content"
        id={popoverId}
        onClick={(event) => {
          if (event.target.closest('button')) {
            setIsOpen(false)
          }
        }}
        role="menu"
      >
        {children}
      </div>
    </div>
  )
}

export default ActionPopover
