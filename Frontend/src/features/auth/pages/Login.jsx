import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { login } from '../auth.api'

const DEMO_CREDENTIALS = {
  email: 'demo@notable.local',
  password: 'demo1234',
}

const styles = `

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background-color: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  /* ── Navbar ── */
  .login-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #dddbd6;
  }
  .login-nav-brand {
    font-size: 1.15rem;
    font-style: italic;
    letter-spacing: -0.01em;
    text-decoration: none;
    color: #1a1a1a;
  }
  .login-nav-brand::after {
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
  .login-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }

  .login-panel {
    width: 100%;
    max-width: 420px;
  }

  .login-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .login-heading {
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 2rem;
    font-style: italic;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 32px;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  /* ── Demo card ── */
  .demo-card {
    border: 1px solid #dddbd6;
    background: #faf9f7;
    border-radius: 6px;
    padding: 18px 20px;
    margin-bottom: 28px;
  }
  .demo-card-header {
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 10px;
  }
  .demo-card-description {
    font-size: 0.88rem;
    color: #555;
    line-height: 1.5;
    margin-bottom: 14px;
  }
  .demo-card-credentials {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 14px;
    margin-bottom: 14px;
  }
  .demo-cred-label {
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #aaa;
    padding-top: 1px;
  }
  .demo-cred-value {
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    color: #444;
  }
  .demo-btn {
    width: 100%;
    padding: 9px 0;
    background: transparent;
    border: 1px solid #c8c6c0;
    border-radius: 4px;
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .demo-btn:hover {
    background: #eeecea;
    border-color: #b0aea8;
    color: #1a1a1a;
  }

  /* ── Divider ── */
  .login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .login-divider-line {
    flex: 1;
    height: 1px;
    background: #dddbd6;
  }
  .login-divider-text {
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #bbb;
  }

  /* ── Form ── */
  .login-field {
    margin-bottom: 18px;
  }
  .login-label {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .login-input {
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
  .login-input::placeholder { color: #bbb; }
  .login-input:focus { border-color: #888; }

  .login-forgot {
    display: block;
    text-align: right;
    font-size: 0.82rem;
    font-style: italic;
    color: #999;
    text-decoration: none;
    margin-top: -10px;
    margin-bottom: 22px;
    transition: color 0.15s;
  }
  .login-forgot:hover { color: #333; }

  .login-error {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #b94a4a;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }

  .login-submit {
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
  .login-submit:hover:not(:disabled) { background: #333; }
  .login-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Footer ── */
  .login-footer {
    margin-top: 22px;
    font-size: 0.88rem;
    color: #999;
    text-align: center;
  }
  .login-footer a {
    color: #1a1a1a;
    text-decoration: none;
    border-bottom: 1px solid #c8c6c0;
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }
  .login-footer a:hover { border-color: #1a1a1a; }
`

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Geist+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const data = await login({ email, password })
      auth.login(data.token, data.user)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function useDemoAccount() {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError('')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        {/* Navbar */}
        <nav className="login-nav">
          <Link to="/" className="login-nav-brand">Notable</Link>
        </nav>

        {/* Main */}
        <main className="login-main">
          <div className="login-panel">
            <p className="login-eyebrow">Welcome back</p>
            <h1 className="login-heading">Log in to your account</h1>

            {/* Demo card */}
            <div className="demo-card">
              <div className="demo-card-header">Demo account</div>
              <p className="demo-card-description">
                Preloaded with notebooks, chapters, todos, resources, and focus sessions.
              </p>
              <div className="demo-card-credentials">
                <span className="demo-cred-label">Email</span>
                <span className="demo-cred-value">{DEMO_CREDENTIALS.email}</span>
                <span className="demo-cred-label">Password</span>
                <span className="demo-cred-value">{DEMO_CREDENTIALS.password}</span>
              </div>
              <button type="button" className="demo-btn" onClick={useDemoAccount}>
                Use demo account
              </button>
            </div>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">or</span>
              <div className="login-divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  className="login-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Link to="/reset-password" className="login-forgot">Forgot password?</Link>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <p className="login-footer">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default Login