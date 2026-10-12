import { useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isValidEmail } from '../utils/validateEmail'
import { safeRedirectPath } from '../utils/safeRedirectPath'

// Turns an API failure into a message for the user. We do not show raw server text for
// 401: "wrong email" vs "wrong password" would tell an attacker which accounts exist.
function messageFor(error) {
  if (error?.kind === 'network') return error.message
  if (error?.kind === 'http') {
    if (error.status === 401) return 'Incorrect email or password.'
    if (error.status === 400) return error.detail ?? 'Check the email and password you entered.'
    if (error.status === 429) return 'Too many attempts. Wait a minute and try again.'
  }
  return 'Something went wrong. Please try again.'
}

function LoginPage() {
  const { status, notice, signIn } = useAuth()
  const [searchParams] = useSearchParams()
  useDocumentTitle('Sign in – SkillShelf')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // The email error appears only after the user left the field (or tried to submit),
  // never while they are still typing their first attempt.
  const [emailTouched, setEmailTouched] = useState(false)
  const emailInput = useRef(null)
  // A ref changes immediately; state updates after the next render. Two quick clicks
  // could both pass a state-based check, so the guard is a ref.
  const inFlight = useRef(false)

  const emailHasText = email.trim() !== ''
  const emailValid = isValidEmail(email)
  const showEmailError = emailTouched && emailHasText && !emailValid
  const emailDescribedBy = showEmailError ? 'email-error' : emailValid ? 'email-ok' : undefined

  // Where to go after signing in: ?returnTo=... if it is a safe internal path, else /saved.
  const returnTo = searchParams.get('returnTo')
  const redirectTo = safeRedirectPath(returnTo)
  const cameFromProtectedPage = safeRedirectPath(returnTo, null) !== null

  // Already signed in (or just signed in): go where the user was heading.
  if (status === 'signedIn') {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return

    const trimmedEmail = email.trim()
    setEmailTouched(true)
    // Only "is it empty?" and "does the email look like an email?" are checked here. Password RULES (length, letters) are not checked on
    // login: the server decides, and the rules are for choosing a NEW password.
    if (trimmedEmail === '' || password === '') {
      setError('Enter your email and password.')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      // The inline message under the field explains the problem; send focus there.
      setError('')
      emailInput.current?.focus()
      return
    }

    inFlight.current = true
    setSubmitting(true)
    setError('')
    try {
      await signIn(trimmedEmail, password)
      // On success the status becomes 'signedIn' and the <Navigate> above takes over.
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
        <h1>Sign in</h1>
        <p>Sign in to see your saved articles.</p>
      </div>
      {notice === 'expired' && <p role="status">Your session has expired. Please sign in again.</p>}
      {cameFromProtectedPage && notice !== 'expired' && (
        <p role="status">Please sign in to continue.</p>
      )}
      <form onSubmit={handleSubmit} noValidate className="form">
        <div className="filter">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            ref={emailInput}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={showEmailError || error ? 'true' : undefined}
            aria-describedby={
              [emailDescribedBy, error ? 'login-error' : null].filter(Boolean).join(' ') ||
              undefined
            }
          />
          {showEmailError && (
            <p id="email-error" className="field-message is-error">
              <span aria-hidden="true" className="field-icon">
                !
              </span>
              Enter a valid email address, like name@example.com.
            </p>
          )}
          {emailValid && (
            <p id="email-ok" className="field-message is-ok">
              <span aria-hidden="true" className="field-icon">
                ✓
              </span>
              Email format looks good.
            </p>
          )}
        </div>
        <div className="filter">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show password
          </label>
        </div>
        {error && (
          <p id="login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="form-footer">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
