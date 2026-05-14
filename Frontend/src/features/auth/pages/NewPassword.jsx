import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../auth.api'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .np-root {
    min-height: 100vh;
    background-color: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  /* ── Navbar ── */
  .np-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #dddbd6;
  }
  .np-nav-brand {
    font-size: 1.15rem;
    font-style: italic;
    letter-spacing: -0.01em;
    text-decoration: none;
    color: #1a1a1a;
  }
  .np-nav-brand::after {
    content: '';
    display: inline-block;
    width: 5px;
    height: 5px;
    background: #1a1a1a;
    border-radius: 50%;
    margin-left: 4px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }

  /* ── Main layout ── */
  .np-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }

  .np-panel {
    width: 100%;
    max-width: 420px;
  }

  .np-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .np-heading {
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 2rem;
    font-style: italic;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 32px;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  /* ── Form ── */
  .np-field {
    margin-bottom: 18px;
  }
  .np-label {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .np-input {
    width: 100%;
    padding: 10px 13px;
    background: #faf9f7;
    border: 1px solid #dddbd6;
    border-radius: 4px;
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 1rem;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.15s;
  }
  .np-input::placeholder { color: #bbb; }
  .np-input:focus { border-color: #888; }
  .np-input:disabled { opacity: 0.5; }

  .np-error {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #b94a4a;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }
  .np-success {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #4a7a4a;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }

  .np-submit {
    width: 100%;
    padding: 11px 0;
    background: #1a1a1a;
    border: none;
    border-radius: 4px;
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f5f4f1;
    cursor: pointer;
    transition: background 0.15s;
  }
  .np-submit:hover:not(:disabled) { background: #333; }
  .np-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Footer ── */
  .np-footer {
    margin-top: 22px;
    font-size: 0.88rem;
    color: #999;
    text-align: center;
  }
  .np-footer a {
    color: #1a1a1a;
    text-decoration: none;
    border-bottom: 1px solid #c8c6c0;
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }
  .np-footer a:hover { border-color: #1a1a1a; }
`

function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Geist+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  async function handleNewPassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await resetPassword({ token, password })
      setMessage(data.message)
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="np-root">
        <nav className="np-nav">
          <Link to="/" className="np-nav-brand">Notable</Link>
        </nav>

        <main className="np-main">
          <div className="np-panel">
            <p className="np-eyebrow">Account recovery</p>
            <h1 className="np-heading">Create a new password</h1>

            {!token && <div className="np-error">Reset token is missing.</div>}

            <form onSubmit={handleNewPassword}>
              <div className="np-field">
                <label className="np-label">New Password</label>
                <input
                  type="password"
                  className="np-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  required
                />
              </div>
              <div className="np-field">
                <label className="np-label">Confirm Password</label>
                <input
                  type="password"
                  className="np-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                  required
                />
              </div>

              {error && <div className="np-error">{error}</div>}
              {message && <div className="np-success">{message}</div>}

              <button type="submit" className="np-submit" disabled={isSubmitting || !token}>
                {isSubmitting ? 'Saving…' : 'Save Password'}
              </button>
            </form>

            <p className="np-footer">
              <Link to="/">Back to login</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default NewPassword