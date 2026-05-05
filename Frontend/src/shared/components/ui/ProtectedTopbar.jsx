import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { BackIcon } from './Icons'

function ProtectedTopbar({
  actions,
  backLabel = 'Back',
  backState,
  backTo,
  className = '',
  showSettings = true,
  title,
}) {
  const auth = useAuth()
  const navigate = useNavigate()

  function logout() {
    auth.logout()
    navigate('/', { replace: true })
  }

  return (
    <header className={`topbar app-topbar ${className}`.trim()}>
      <div className="app-topbar__identity">
        {backTo && (
          <Link
            aria-label={backLabel}
            className="app-topbar__back"
            state={backState}
            to={backTo}
          >
            <BackIcon className="ui-icon" />
            <span>{backLabel}</span>
          </Link>
        )}
        <h1>{title}</h1>
      </div>
      <div className="app-topbar__actions">
        {actions}
        {showSettings && (
          <Link className="dashboard-tool-button dashboard-tool-button--text topbar__link" to="/settings">
            Settings
          </Link>
        )}
        <button
          className="dashboard-tool-button dashboard-tool-button--text"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default ProtectedTopbar
