import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isValidEmail } from '../utils/validateEmail'

// The API's answer is generic (it does not reveal whether the account exists); we show it as is.
// This wording is only a fallback if the server sends no message.
const GENERIC_DONE =
  'If an account exists for that email, a reset link has been sent. Check your inbox.'

function messageFor(error) {
  if (error?.kind === 'network') return error.message
  if (error?.kind === 'http') {
    if (error.status === 429) return 'Too many requests. Wait a minute and try again.'
    if (error.status === 400) return error.detail ?? 'Check the email you entered.'
  }
  return 'Something went wrong. Please try again.'
}

function ForgotPasswordPage() {
  useDocumentTitle('Forgot password – SkillShelf')
  const location = useLocation()
  // The account page sends the signed-in email along; it is only a convenience prefill.
  const [email, setEmail] = useState(
    typeof location.state?.email === 'string' ? location.state.email : '',
  )
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [doneMessage, setDoneMessage] = useState('')
  const input = useRef(null)
  const inFlight = useRef(false)

  const hasText = email.trim() !== ''
  const showError = touched && hasText && !isValidEmail(email)

  async function handleSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return
    const trimmed = email.trim()
    setTouched(true)
    if (trimmed === '') {
      setError('Enter your email.')
      input.current?.focus()
      return
    }
    if (!isValidEmail(trimmed)) {
      setError('')
      input.current?.focus()
      return
    }
    inFlight.current = true
    setSubmitting(true)
    setError('')
    try {
      const result = await forgotPassword({ email: trimmed })
      setDoneMessage(result?.message || GENERIC_DONE)
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
        <h1>Forgot your password?</h1>
        <p>Enter your email and we will send you a link to choose a new password.</p>
      </div>

            {doneMessage ? (
        <div role="status" className="form">
          <p>{doneMessage}</p>
          <p className="form-footer">
            <Link to="/reset-token">I have a reset token</Link>
          </p>
          <p className="form-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="form">
          <div className="filter">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              ref={input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={showError || error ? 'true' : undefined}
              aria-describedby={
                [showError ? 'forgot-email-error' : null, error ? 'forgot-error' : null]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
            />
            {showError && (
              <p id="forgot-email-error" className="field-message is-error">
                <span aria-hidden="true" className="field-icon">
                  !
                </span>
                Enter a valid email address, like name@example.com.
              </p>
            )}
          </div>
          {error && (
            <p id="forgot-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="form-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default ForgotPasswordPage