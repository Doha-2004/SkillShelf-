import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import PasswordRequirements from '../components/PasswordRequirements'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { checkPassword } from '../utils/passwordRules'

function messageFor(error) {
  if (error?.kind === 'network') return { text: error.message, linkProblem: false }
  if (error?.kind === 'http') {
    if (error.status === 429)
      return { text: 'Too many attempts. Wait a minute and try again.', linkProblem: false }
    if (error.status === 400)
      return {
        text: error.detail ?? 'This reset link is invalid or has expired.',
        linkProblem: true,
      }
  }
  return { text: 'Something went wrong. Please try again.', linkProblem: false }
}

// The reset link carries ?email=...&token=.... We read them ONCE into component state and
// immediately replace the address with a clean /reset-password (history.replace, so the Back
// button cannot bring the token back). After that the token lives only in memory: a refresh
// shows "link missing" instead of silently reusing a secret.
function ResetPasswordPage() {
  useDocumentTitle('Reset password – SkillShelf')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { status, signOut } = useAuth()
  const [link] = useState(() => ({
    email: (searchParams.get('email') ?? '').trim(),
    token: searchParams.get('token') ?? '',
  }))

  useEffect(() => {
    if (searchParams.has('token') || searchParams.has('email')) {
      navigate('/reset-password', { replace: true })
    }
  }, [searchParams, navigate])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState('')
  const inFlight = useRef(false)

  const hasLink = link.email !== '' && link.token !== ''
  const rules = checkPassword(password)
  const mismatch = confirmTouched && confirm !== '' && confirm !== password
  const canSubmit = rules.valid && confirm === password

  if (done) {
    return (
      <div className="auth-page">
        <div className="page-intro">
          <h1>Password changed</h1>
        </div>
        <div role="status" className="form">
          <p>{done}</p>
          <p className="form-footer">
            <Link to="/login">Sign in with your new password</Link>
          </p>
        </div>
      </div>
    )
  }

  if (!hasLink) {
    return (
      <div className="auth-page">
        <div className="page-intro">
          <h1>Reset link missing</h1>
          <p>
            This page needs the link from your reset email. If you refreshed the page or opened it
            directly, request a new link.
          </p>
        </div>
        <p className="form-footer">
          <Link to="/forgot-password">Request a new reset link</Link>
        </p>
      </div>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return
    setConfirmTouched(true)
    if (!canSubmit) return
    inFlight.current = true
    setSubmitting(true)
    setError(null)
    try {
      const result = await resetPassword({
        email: link.email,
        token: link.token,
        newPassword: password,
      })
      // The server revoked every session of this account: forget the local one too.
      if (status === 'signedIn') signOut()
      setDone(result?.message || 'Your password has been changed.')
    } catch (caught) {
      setError(messageFor(caught))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="page-intro">
        <h1>Choose a new password</h1>
        <p>For {link.email}</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="form">
        <div className="filter">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="password-rules"
          />
          <PasswordRequirements password={password} id="password-rules" />
        </div>
        <div className="filter">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            onBlur={() => setConfirmTouched(true)}
            aria-invalid={mismatch ? 'true' : undefined}
            aria-describedby={mismatch ? 'confirm-error' : undefined}
          />
          {mismatch && (
            <p id="confirm-error" className="field-message is-error">
              <span aria-hidden="true" className="field-icon">
                !
              </span>
              The two passwords do not match.
            </p>
          )}
          <label className="check-row">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show passwords
          </label>
        </div>
        {error && (
          <div role="alert">
            <p>{error.text}</p>
            {error.linkProblem && (
              <p>
                <Link to="/forgot-password">Request a new reset link</Link>
              </p>
            )}
          </div>
        )}
        <button type="submit" className="button-primary" disabled={submitting || !canSubmit}>
          {submitting ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
