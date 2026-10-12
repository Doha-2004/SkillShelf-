import { Navigate, useLocation } from 'react-router-dom'
import { loginPathFor } from '../utils/safeRedirectPath'
import { useAuth } from './useAuth'

// Wraps a page that needs a signed-in user.
//
// Important: this only decides what the UI shows. It is NOT security. Anyone can edit
// frontend code in their browser; the real protection is that the API answers 401 to
// requests without a valid token.
function ProtectedRoute({ children }) {
  const auth = useAuth()
  const location = useLocation()

  // A saved token is being checked (e.g. right after a refresh). Do not bounce the user
  // to the login page yet: that would sign-in-prompt someone who IS signed in.
  if (auth.status === 'restoring') {
    return <p role="status">Checking your session…</p>
  }

  if (auth.status === 'restoreFailed') {
    return (
      <div role="alert">
        <p>We could not check your session. Check your connection and try again.</p>
        <button type="button" className="button-primary" onClick={auth.retryRestore}>
          Try again
        </button>
      </div>
    )
  }

  if (auth.status === 'signedOut') {
    // Remember where the user wanted to go (?returnTo=...); the login page sends them back there.
    return <Navigate to={loginPathFor(location.pathname + location.search)} replace />
  }

  return children
}

export default ProtectedRoute
