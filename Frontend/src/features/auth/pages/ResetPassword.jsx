import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../auth.api'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    background-color: #f5f4f1;
    font-family: 'Inria Serif', Georgia, serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  .rp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #dddbd6;
  }
  .rp-nav-brand {
    font-size: 1.15rem;
    font-style: italic;
    letter-spacing: -0.01em;
    text-decoration: none;
    color: #1a1a1a;
  }
  .rp-nav-brand::after {
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

  .rp-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }

  .rp-panel {
    width: 100%;
    max-width: 420px;
  }

  .rp-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .rp-heading {
    font-family: 'Inria Serif', Georgia, serif;
    font-size: 2rem;
    font-style: italic;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 10px;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .rp-subheading {
    font-size: 0.92rem;
    color: #888;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .rp-field {
    margin-bottom: 18px;
  }
  .rp-label {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .rp-input {
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
  .rp-input::placeholder { color: #bbb; }
  .rp-input:focus { border-color: #888; }

  .rp-error {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #b94a4a;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }

  .rp-submit {
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
  .rp-submit:hover:not(:disabled) { background: #333; }
  .rp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Result notice ── */
  .rp-notice {
    margin-top: 20px;
    border: 1px solid #dddbd6;
    background: #faf9f7;
    border-radius: 6px;
    padding: 16px 18px;
  }
  .rp-notice-label {
    font-family: 'Geist Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }
  .rp-notice-message {
    font-size: 0.92rem;
    color: #444;
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .rp-notice-token {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem;
    color: #555;
    background: #eeecea;
    border-radius: 3px;
    padding: 6px 10px;
    margin-bottom: 12px;
    word-break: break-all;
  }
  .rp-notice-link {
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1a1a1a;
    text-decoration: none;
    border-bottom: 1px solid #c8c6c0;
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }
  .rp-notice-link:hover { border-color: #1a1a1a; }

  /* ── Footer ── */
  .rp-footer {
    margin-top: 22px;
    font-size: 0.88rem;
    color: #999;
    text-align: center;
  }
  .rp-footer a {
    color: #1a1a1a;
    text-decoration: none;
    border-bottom: 1px solid #c8c6c0;
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }
  .rp-footer a:hover { border-color: #1a1a1a; }
`

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Geist+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

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
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <nav className="rp-nav">
          <Link to="/" className="rp-nav-brand">Notable</Link>
        </nav>

        <main className="rp-main">
          <div className="rp-panel">
            <p className="rp-eyebrow">Account recovery</p>
            <h1 className="rp-heading">Reset your password</h1>
            <p className="rp-subheading">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleReset}>
              <div className="rp-field">
                <label className="rp-label">Email</label>
                <input
                  type="email"
                  className="rp-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="rp-error">{error}</div>}

              <button type="submit" className="rp-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            {result && (
              <div className="rp-notice">
                <div className="rp-notice-label">Reset link sent</div>
                <p className="rp-notice-message">{result.message}</p>
                {result.resetToken && (
                  <code className="rp-notice-token">{result.resetToken}</code>
                )}
                {result.resetLink && (
                  <Link to={`/new-password?token=${result.resetToken}`} className="rp-notice-link">
                    Open reset form →
                  </Link>
                )}
              </div>
            )}

            <p className="rp-footer">
              <Link to="/">Back to login</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default ResetPassword