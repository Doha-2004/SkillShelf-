// The ONLY file that knows where the session token is kept.
//
// Decision: localStorage.
//   + survives a refresh and is shared by tabs (open a shared link in a new tab: still signed in)
//   - any script running on our page can read it (XSS). We reduce that risk by never rendering
//     API text as HTML, but we cannot remove it: the API gives us a Bearer token, not a cookie,
//     so an HttpOnly cookie (the safest option) is not available to us.
// Alternatives: memory only (safest, but every refresh signs the user out) or sessionStorage
// (same XSS exposure, signs out when the tab closes). Switching = changing this file only.
//
// Only the token and its expiry are stored. The user's name/email are NOT: they are loaded
// from /api/auth/me, so the server stays the source of truth.

export const SESSION_STORAGE_KEY = 'skillshelf.session'

// Storage can throw (blocked cookies, private mode, quota). Auth must degrade, not crash.
export function saveSession({ accessToken, expiresAt }) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accessToken, expiresAt }))
    return true
  } catch {
    return false // the user stays signed in for this page view only
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // nothing else we can do
  }
}

// Returns { accessToken, expiresAt } or null. Corrupted or expired data is deleted.
export function loadSession() {
  let raw
  try {
    raw = localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return null // storage is blocked: behave as signed out
  }
  if (!raw) return null

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    clearSession() // not JSON: someone edited it or it was cut off. Remove it.
    return null
  }

  const valid =
    typeof data?.accessToken === 'string' &&
    data.accessToken !== '' &&
    typeof data?.expiresAt === 'string' &&
    Number.isFinite(Date.parse(data.expiresAt))

  if (!valid || Date.parse(data.expiresAt) <= Date.now()) {
    clearSession()
    return null
  }
  return { accessToken: data.accessToken, expiresAt: data.expiresAt }
}
