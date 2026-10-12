import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useSaved } from '../saved/useSaved'
import { describeApiError } from '../utils/apiMessages'
import { loginPath } from '../utils/returnTo'

// The Save / Remove button of an article page.
//
// Signed out: the button sends the user to /login?returnTo=<this article>. After signing in
// they are back on the article and press Save again (no automatic saving: the user always
// completes the action themselves, with the result in front of them).
function SaveControl({ article }) {
  const auth = useAuth()
  const saved = useSaved()
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const { ensureLoaded } = saved

  useEffect(() => {
    if (auth.status === 'signedIn') ensureLoaded()
  }, [auth.status, ensureLoaded])

  const returnTo = location.pathname + location.search

  if (auth.status === 'signedOut') {
    return (
      <div className="save-control">
        <button type="button" onClick={() => navigate(loginPath(returnTo))}>
          Save article
        </button>
        <p className="save-hint">
          {auth.notice === 'expired'
            ? 'Your session has expired. Sign in again to save articles.'
            : 'You need to sign in to save articles.'}
        </p>
      </div>
    )
  }

  if (auth.status === 'restoreFailed') {
    return (
      <div className="save-control">
        <button type="button" onClick={auth.retryRestore}>
          Save article
        </button>
        <p className="save-hint">We could not check your session. Press the button to retry.</p>
      </div>
    )
  }

  if (auth.status === 'restoring' || saved.status === 'idle' || saved.status === 'loading') {
    return (
      <div className="save-control">
        <button type="button" disabled>
          Save article
        </button>
        <p className="save-hint" aria-live="polite">
          Checking your saved articles…
        </p>
      </div>
    )
  }

  if (saved.status === 'error') {
    // A 401 already ended the session; the status flips to signedOut on the next render.
    return (
      <div className="save-control" role="alert">
        <p>We could not load your saved articles. {describeApiError(saved.error)}</p>
        <button type="button" onClick={saved.reload}>
          Try again
        </button>
      </div>
    )
  }

  const isSaved = saved.isSaved(article.id)
  const pending = saved.pendingIds.has(article.id)

  async function handleClick() {
    setMessage('')
    setFailed(false)
    try {
      if (isSaved) {
        await saved.remove(article.id)
        setMessage('Removed from your saved articles.')
      } else {
        await saved.save(article)
        setMessage('Saved. You can find it on your Saved page.')
      }
    } catch (error) {
      if (error?.kind === 'http' && error.status === 401) {
        // Same flow as a protected page: sign in again, then come back to this article.
        navigate(loginPath(returnTo))
        return
      }
      setFailed(true)
      setMessage(describeApiError(error, 'We could not update your saved articles.'))
    }
  }

  return (
    <div className="save-control">
      <button
        type="button"
        className={isSaved ? undefined : 'button-primary'}
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending ? 'true' : undefined}
      >
        {pending
          ? isSaved
            ? 'Removing…'
            : 'Saving…'
          : isSaved
            ? 'Remove from saved'
            : 'Save article'}
      </button>
      <p
        className={failed ? 'save-hint is-error' : 'save-hint'}
        role={failed ? 'alert' : undefined}
        aria-live={failed ? undefined : 'polite'}
      >
        {message || (isSaved ? '✓ This article is in your saved list.' : '')}
      </p>
    </div>
  )
}

export default SaveControl
