import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../auth.api'
import Navbar from '../components/Navbar'

function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

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
    <div className="auth-page">
      <Navbar />
      <main className="auth-content">
        <h1 className="auth-title">New Password</h1>
        <section className="auth-card">
          <div className="auth-card-title">Create Your New Password</div>
          <div className="auth-card-subtitle">Please enter your new password</div>
          {!token && <div className="error">Reset token is missing.</div>}
          <form onSubmit={handleNewPassword}>
            <div>
              <label className="auth-form-label">Password</label>
              <input
                type="password"
                className="auth-form-input"
                placeholder="New password"
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
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting || !token}>
              {isSubmitting ? 'Saving...' : 'Save Password'}
            </button>
          </form>
          <div className="auth-footer-text">
            <Link to="/">Back to login</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default NewPassword
