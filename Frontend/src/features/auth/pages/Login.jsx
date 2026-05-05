import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { login } from '../auth.api'
import Navbar from '../components/Navbar'

const DEMO_CREDENTIALS = {
  email: 'demo@notable.local',
  password: 'demo1234',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    <div className="auth-page">
      <Navbar />
      <main className="auth-content">
        <h1 className="auth-title">Log In</h1>
        <section className="auth-card">
          <div className="auth-card-title">Login to your Account</div>
          <div className="auth-card-subtitle">Enter your email and password</div>
          <div className="demo-login-card">
            <div>
              <strong>Demo account</strong>
              <p>Preloaded with notebooks, chapters, todos, resources, and focus sessions.</p>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{DEMO_CREDENTIALS.email}</dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd>{DEMO_CREDENTIALS.password}</dd>
              </div>
            </dl>
            <button type="button" className="demo-login-button" onClick={useDemoAccount}>
              Use demo account
            </button>
          </div>
          <form onSubmit={handleLogin}>
            <div>
              <label className="auth-form-label">Email</label>
              <input
                type="email"
                className="auth-form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="auth-form-label">Password</label>
              <input
                type="password"
                className="auth-form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Link to="/reset-password" className="forgot-password-link">Forgot Password?</Link>
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="auth-footer-text">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login
