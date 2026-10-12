import { createContext, useContext } from 'react'

// The context object and the hook that reads it. The provider component lives in
// AuthProvider.jsx (a file that exports components should export only components).
//
// What `useAuth()` returns:
//   status   'restoring'     a saved token exists and we are asking the server if it is still valid
//            'signedIn'      user is known
//            'signedOut'     no valid session
//            'restoreFailed' could not reach the server to check the saved token (it is kept)
//   user     { id, name, email } or null
//   token    the Bearer token or null (pass it to API functions that need it)
//   notice   'expired' when the session ended because the time ran out, else null
//   signIn(email, password)   rejects with ApiError on failure
//   signOut()                 forgets the session at once, then tells the server (best effort)
//   expireSession()           use when any API call answers 401
//   retryRestore()            try the session check again after 'restoreFailed'
export const AuthContext = createContext(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
