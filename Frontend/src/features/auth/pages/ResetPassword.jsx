import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../auth.api'
import Navbar from '../components/Navbar'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleReset(event) {
    event.preventDefault()
    setError('')
    setResult(null)
    setIsSubmitting(true)
    try {
      const data = await requestPasswordReset({ email })
      setResult(data)
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
        <h1 className="auth-title">Password Reset</h1>
        <section className="auth-card">
          <div className="auth-card-title">Reset Your Password</div>
          <div className="auth-card-subtitle">Enter your email and we'll send a reset link</div>
          <form onSubmit={handleReset}>
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
            {error && <div className="error">{error}</div>}
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Send Reset Link'}
            </button>
          </form>
          {result && (
            <div className="notice" style={{ marginTop: '16px' }}>
              <strong>{result.message}</strong>
              {result.resetToken && <code>{result.resetToken}</code>}
              {result.resetLink && <Link to={`/new-password?token=${result.resetToken}`}>Open reset form</Link>}
            </div>
          )}
          <div className="auth-footer-text">
            <Link to="/">Back to login</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ResetPassword
