import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/apiClient'
import { getMe, login, logout } from '../api/authApi'
import { AuthContext } from './useAuth'
import { SESSION_STORAGE_KEY, clearSession, loadSession, saveSession } from './tokenStorage'

const SIGNED_OUT = { status: 'signedOut', token: null, expiresAt: null, user: null, notice: null }
const MAX_TIMER_MS = 2 ** 31 - 1 // setTimeout fires immediately for larger values

// A saved token is NOT proof the user is signed in: it may have been revoked
// (a password reset ends every session). So we start in 'restoring' and ask the server.
function stateFromStorage() {
  const session = loadSession()
  if (!session) return SIGNED_OUT
  return {
    status: 'restoring',
    token: session.accessToken,
    expiresAt: session.expiresAt,
    user: null,
    notice: null,
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(stateFromStorage)

  // 1) Verify a saved token with the server (page refresh, new tab, other tab signed in).
  useEffect(() => {
    if (state.status !== 'restoring') return
    const controller = new AbortController()

    getMe({ token: state.token, signal: controller.signal })
      .then((user) => {
        if (controller.signal.aborted) return
        setState((current) => ({ ...current, status: 'signedIn', user }))
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        if (error.kind === 'http' && error.status === 401) {
          clearSession() // the server says this token is dead
          setState(SIGNED_OUT)
        } else {
          // Offline or server trouble: we do not know. Keep the token, let the user retry.
          setState((current) => ({ ...current, status: 'restoreFailed' }))
        }
      })

    return () => controller.abort()
  }, [state.status, state.token])

  // 2) End the session when the token's time runs out, instead of waiting for a 401.
  useEffect(() => {
    if (!state.token) return
    const msLeft = Date.parse(state.expiresAt) - Date.now()
    const timer = setTimeout(
      () => {
        clearSession()
        setState({ ...SIGNED_OUT, notice: 'expired' })
      },
      Math.min(Math.max(msLeft, 0), MAX_TIMER_MS),
    )
    return () => clearTimeout(timer)
  }, [state.token, state.expiresAt])

  // 3) Another tab signed in or out: follow it. ("storage" events fire in the OTHER tabs only.)
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== null && event.key !== SESSION_STORAGE_KEY) return // key === null: storage cleared
      setState(stateFromStorage())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  async function signIn(email, password) {
    const data = await login({ email, password })
    const valid =
      typeof data?.accessToken === 'string' &&
      data.accessToken !== '' &&
      Number.isFinite(Date.parse(data?.expiresAt)) &&
      data?.user
    if (!valid) {
      throw new ApiError({
        kind: 'parse',
        message: 'The server sent a response we could not read.',
      })
    }
    saveSession({ accessToken: data.accessToken, expiresAt: data.expiresAt })
    setState({
      status: 'signedIn',
      token: data.accessToken,
      expiresAt: data.expiresAt,
      user: data.user,
      notice: null,
    })
  }

  function signOut() {
    const { token } = state
    clearSession() // forget locally FIRST: the user must not stay signed in if the request fails
    setState(SIGNED_OUT)
    if (token) logout({ token }).catch(() => {}) // best effort; the server session ends by itself at expiry
  }

  // Stable identity (useCallback): other providers list it in effect dependencies.
  const expireSession = useCallback(() => {
    clearSession()
    setState({ ...SIGNED_OUT, notice: 'expired' })
  }, [])

  function retryRestore() {
    setState((current) =>
      current.status === 'restoreFailed' ? { ...current, status: 'restoring' } : current,
    )
  }

  const value = { ...state, signIn, signOut, expireSession, retryRestore }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
