import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { login, register } from '../auth.api'
import Navbar from '../components/Navbar'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleRegister(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        name,
        email,
        password,
        display_name: name,
      })
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
    <div className="auth-page">
      <Navbar />
      <main className="auth-content">
        <h1 className="auth-title">Sign Up</h1>
        <section className="auth-card">
          <div className="auth-card-title">Create Your Account</div>
          <div className="auth-card-subtitle">Enter your details and create your password</div>
          <form onSubmit={handleRegister}>
            <div>
              <label className="auth-form-label">Name</label>
              <input
                type="text"
                className="auth-form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
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
            <div>
              <label className="auth-form-label">Confirm Password</label>
              <input
                type="password"
                className="auth-form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-footer-text">
            Already have an account? <Link to="/">Login</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Register
