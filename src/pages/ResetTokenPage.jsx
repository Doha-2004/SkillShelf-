import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isValidEmail } from '../utils/validateEmail'

// Reads ?name=value (or #name=value) from pasted text WITHOUT turning "+" into a space,
// which URLSearchParams would do and which would corrupt a token.
function readParam(text, name) {
  const match = text.match(new RegExp(`[?&#]${name}=([^&#\\s]*)`))
  if (!match) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return ''
  }
}

// Manual entry point to the reset flow: paste the token (or the whole link from the email),
// then continue to /reset-password, which already validates and submits the new password.
function ResetTokenPage() {
  useDocumentTitle('Enter reset token – SkillShelf')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const raw = value.trim()
    const isLink = /^https?:\/\//i.test(raw)
    const token = isLink ? readParam(raw, 'token') : raw
    const address = ((isLink && readParam(raw, 'email')) || email).trim()

    if (!token) {
      setError(
        isLink
          ? 'This link has no token. Paste the full link from the email, or the token itself.'
          : 'Paste the token or the full reset link.',
      )
      return
    }
    if (!isValidEmail(address)) {
      setError('Enter the email address the reset link was sent to.')
      return
    }
    setError('')
    // The reset page reads these once, keeps them in memory and cleans the address bar.
    const query = new URLSearchParams({ email: address, token })
    navigate(`/reset-password?${query.toString()}`)
  }

  return (
    <div className="auth-page">
      <div className="page-intro">
        <h1>Enter your reset token</h1>
        <p>Paste the token (or the whole link) from the reset email.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="form">
        <div className="filter">
          <label htmlFor="token-email">Email</label>
          <input
            id="token-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="filter">
          <label htmlFor="token-value">Reset token or link</label>
          <input
            id="token-value"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby={error ? 'token-error' : undefined}
          />
        </div>
        {error && (
          <p id="token-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button-primary">
          Continue
        </button>
        <p className="form-footer">
          <Link to="/forgot-password">Request a new reset link</Link>
        </p>
      </form>
    </div>
  )
}

export default ResetTokenPage