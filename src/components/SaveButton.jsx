import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useSaved } from '../saved/useSaved'
import { loginPathFor } from '../utils/safeRedirectPath'

// Save / remove for one article.
//
// Signed-out visitors: the button says "Sign in to save" and leads to
// /login?returnTo=<this article>. After signing in they land on this article again and press
// Save themselves. (Saving automatically after login is optional in the assignment; we chose
// the clearer, simpler flow: the user always sees what happens.)
function SaveButton({ article }) {
  const auth = useAuth()
  const saved = useSaved()
  const navigate = useNavigate()
  const location = useLocation()
  const [feedback, setFeedback] = useState(null) // { tone: 'ok' | 'error', text }

  if (auth.status === 'restoring') {
    return (
      <button type="button" disabled>
        Checking your session…
      </button>
    )
  }

  if (auth.status !== 'signedIn') {
    return (
      <button
        type="button"
        className="button-primary"
        onClick={() => navigate(loginPathFor(location.pathname + location.search))}
      >
        Sign in to save
      </button>
    )
  }

  if (saved.status === 'error') {
    return (
      <div role="alert" className="inline-alert">
        <p>We could not load your saved articles. {saved.message}</p>
        <button type="button" onClick={saved.reload}>
          Try again
        </button>
      </div>
    )
  }

  if (saved.status !== 'ready') {
    return (
      <button type="button" disabled>
        Loading your saved list…
      </button>
    )
  }

  const isSaved = saved.isSaved(article.id)
  const pending = saved.isPending(article.id)

  async function handleClick() {
    setFeedback(null)
    const result = isSaved ? await saved.remove(article.id) : await saved.save(article)
    if (result.ok) {
      setFeedback({ tone: 'ok', text: isSaved ? 'Removed from your saved articles.' : 'Saved.' })
    } else if (result.kind === 'unauthorized') {
      // The session is already cleared; go through the same login-and-return flow.
      navigate(loginPathFor(location.pathname + location.search))
    } else if (result.kind !== 'busy' && result.kind !== 'signedOut') {
      setFeedback({ tone: 'error', text: result.message })
    }
  }

  return (
    <div className="save-action">
      <button
        type="button"
        className={isSaved ? undefined : 'button-primary'}
        disabled={pending}
        onClick={handleClick}
      >
        {pending
          ? isSaved
            ? 'Removing…'
            : 'Saving…'
          : isSaved
            ? 'Remove from saved'
            : 'Save article'}
      </button>
      {feedback && (
        <p
          className={`field-message ${feedback.tone === 'ok' ? 'is-ok' : 'is-error'}`}
          role={feedback.tone === 'error' ? 'alert' : undefined}
          aria-live={feedback.tone === 'ok' ? 'polite' : undefined}
        >
          <span aria-hidden="true" className="field-icon">
            {feedback.tone === 'ok' ? '✓' : '!'}
          </span>
          {feedback.text}
        </p>
      )}
    </div>
  )
}

export default SaveButton
