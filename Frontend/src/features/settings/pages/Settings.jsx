import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import FeedbackBanner from '../../../shared/components/ui/FeedbackBanner'
import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import { normalizeGoogleCalendarEmbedUrl } from '../../../utils/calendar'
import { changePassword, getProfile, updateProfile } from '../settings.api'

const emptyPasswordForm = {
  current_password: '',
  new_password: '',
  confirm_password: '',
}

function Settings() {
  const auth = useAuth()
  const location = useLocation()
  const returnTo = location.state?.returnTo || '/dashboard'
  const returnLabel = location.state?.returnLabel || 'Dashboard'
  const returnState = location.state?.returnState || null
  const [profileForm, setProfileForm] = useState({ name: '', display_name: '', gcal_url: '' })
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getProfile()
        const user = profileData.user
        setProfileForm({
          name: user.name || '',
          display_name: user.display_name || '',
          gcal_url: user.gcal_url || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function submitProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const normalizedGcalUrl = normalizeGoogleCalendarEmbedUrl(profileForm.gcal_url)
    if (normalizedGcalUrl === null) {
      setError('Google Calendar URL must be a public calendar embed URL.')
      return
    }

    setIsSavingProfile(true)
    try {
      const nextProfile = { ...profileForm, gcal_url: normalizedGcalUrl }
      await updateProfile(nextProfile)
      setProfileForm(nextProfile)
      auth.updateUser({ ...auth.user, ...nextProfile })
      setMessage('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function submitPassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match.')
      return
    }

    setIsSavingPassword(true)
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setPasswordForm(emptyPasswordForm)
      setMessage('Password updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <main className="app-shell settings-page">
      <ProtectedTopbar
        backLabel={returnLabel}
        backState={returnState}
        backTo={returnTo}
        className="settings-topbar"
        showSettings={false}
        title="Account Settings"
      />

      <FeedbackBanner error={error} message={message} />

      {isLoading ? (
        <div className="panel">Loading profile...</div>
      ) : (
        <div className="settings-layout">
          <section className="settings-card">
            <div className="settings-card__header">
              <h2>Profile</h2>
              <p>Manage the identity shown across your workspace.</p>
            </div>
            <form className="stack" onSubmit={submitProfile}>
              <label className="auth-form-label">
                Full Name
                <input
                  className="auth-form-input"
                  onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                  required
                  value={profileForm.name}
                />
              </label>
              <label className="auth-form-label">
                Display Name
                <input
                  className="auth-form-input"
                  onChange={(event) => setProfileForm({ ...profileForm, display_name: event.target.value })}
                  value={profileForm.display_name}
                />
              </label>
              <button className="auth-submit-btn" disabled={isSavingProfile} type="submit">
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-card__header">
              <h2>Calendar</h2>
              <p>Paste a public Google Calendar embed URL. Clear the input and save to reset it.</p>
            </div>
            <form className="stack" onSubmit={submitProfile}>
              <label className="auth-form-label">
                Google Calendar Embed URL
                <input
                  className="auth-form-input"
                  onChange={(event) => setProfileForm({ ...profileForm, gcal_url: event.target.value })}
                  placeholder="https://calendar.google.com/calendar/embed?src=..."
                  type="url"
                  value={profileForm.gcal_url}
                />
              </label>
              <p className="muted">Use the embed URL from Google Calendar settings, not a share/download link.</p>
              <button
                className="ghost-button"
                onClick={() => setProfileForm({ ...profileForm, gcal_url: '' })}
                type="button"
              >
                Clear Calendar Link
              </button>
              <button className="auth-submit-btn" disabled={isSavingProfile} type="submit">
                {isSavingProfile ? 'Saving...' : 'Save Calendar'}
              </button>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-card__header">
              <h2>Password</h2>
              <p>Change your password using your current password.</p>
            </div>
            <form className="stack" onSubmit={submitPassword}>
              <label className="auth-form-label">
                Current Password
                <input
                  className="auth-form-input"
                  onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
                  type="password"
                  value={passwordForm.current_password}
                  required
                />
              </label>
              <label className="auth-form-label">
                New Password
                <input
                  className="auth-form-input"
                  minLength="6"
                  onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
                  type="password"
                  value={passwordForm.new_password}
                  required
                />
              </label>
              <label className="auth-form-label">
                Confirm New Password
                <input
                  className="auth-form-input"
                  minLength="6"
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })}
                  type="password"
                  value={passwordForm.confirm_password}
                  required
                />
              </label>
              <button className="auth-submit-btn" disabled={isSavingPassword} type="submit">
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default Settings
