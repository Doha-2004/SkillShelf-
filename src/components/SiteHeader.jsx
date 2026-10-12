import { startTransition } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function SiteHeader() {
  const { status, user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    // Go home explicitly. Otherwise, signing out on a protected page would redirect to the
    // login page with "please sign in to continue", which is wrong after choosing to leave.
    //
    // Both updates go into ONE transition so React applies them in the same render. The
    // router already updates the URL as a transition; if the auth state changed first,
    // ProtectedRoute would briefly see "signed out" on the old page and redirect to /login.
    startTransition(() => {
      navigate('/articles')
      signOut()
    })
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-title">
          SkillShelf
        </Link>
        <nav aria-label="Main" className="site-nav">
          <NavLink to="/articles">Articles</NavLink>
          {status === 'signedIn' ? (
            <>
              <NavLink to="/saved">Saved</NavLink>
              <NavLink to="/me" className="nav-user">
                {user.name}
              </NavLink>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            status !== 'restoring' && <NavLink to="/login">Sign in</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader