import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { login, register } from '../auth.api'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .reg-root {
    min-height: 100vh;
    background-color: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  .reg-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #dddbd6;
  }
  .reg-nav-brand {
    font-size: 1.15rem;
    font-style: italic;
    letter-spacing: -0.01em;
    text-decoration: none;
    color: #1a1a1a;
  }
  .reg-nav-brand::after {
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

  .reg-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }

  .reg-panel {
    width: 100%;
    max-width: 420px;
  }

  .reg-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .reg-heading {
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 2rem;
    font-style: italic;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 32px;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .reg-field {
    margin-bottom: 18px;
  }
  .reg-label {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .reg-input {
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
  .reg-input::placeholder { color: #bbb; }
  .reg-input:focus { border-color: #888; }

  .reg-error {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #b94a4a;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }

  .reg-submit {
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
  .reg-submit:hover:not(:disabled) { background: #333; }
  .reg-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .reg-footer {
    margin-top: 22px;
    font-size: 0.88rem;
    color: #999;
    text-align: center;
  }
  .reg-footer a {
    color: #1a1a1a;
    text-decoration: none;
    border-bottom: 1px solid #c8c6c0;
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }
  .reg-footer a:hover { border-color: #1a1a1a; }
`

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Geist+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  async function handleRegister(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name, email, password, display_name: name })
      const data = await login({ email, password })
      auth.login(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="reg-root">
        <nav className="reg-nav">
          <Link to="/" className="reg-nav-brand">Notable</Link>
        </nav>

        <main className="reg-main">
          <div className="reg-panel">
            <p className="reg-eyebrow">Get started</p>
            <h1 className="reg-heading">Create your account</h1>

            <form onSubmit={handleRegister}>
              <div className="reg-field">
                <label className="reg-label">Name</label>
                <input
                  type="text"
                  className="reg-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="reg-field">
                <label className="reg-label">Email</label>
                <input
                  type="email"
                  className="reg-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="reg-field">
                <label className="reg-label">Password</label>
                <input
                  type="password"
                  className="reg-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="reg-field">
                <label className="reg-label">Confirm Password</label>
                <input
                  type="password"
                  className="reg-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="reg-error">{error}</div>}

              <button type="submit" className="reg-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Sign Up'}
              </button>
            </form>

            <p className="reg-footer">
              Already have an account? <Link to="/">Login</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default Register