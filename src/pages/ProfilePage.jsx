import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// The signed-in user's account page (/me). The name and email come from the session
// (GET /api/auth/me), so the server stays the source of truth. The API has no
// "change password" endpoint for signed-in users: the only way to set a new password is the
// reset-by-email flow, so the button below simply starts that flow.
function ProfilePage() {
  const { user } = useAuth()
  useDocumentTitle('My account – SkillShelf')

  return (
    <>
      <div className="page-intro">
        <h1>My account</h1>
      </div>
      <div className="form">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <Link to="/saved">Your saved articles</Link>
        </p>
        <h2>Password</h2>
        <p>
          We cannot change your password here. Instead we email you a reset link; open it to choose
          a new password. After you reset it, you will be signed out and must sign in again.
        </p>
        <p>
          <Link to="/forgot-password" state={{ email: user.email }} className="button-primary">
            Email me a reset link
          </Link>
        </p>
      </div>
    </>
  )
}

export default ProfilePage