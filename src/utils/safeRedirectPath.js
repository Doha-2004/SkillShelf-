// After login we send the user back to the page they wanted. That page comes from the
// `returnTo` query parameter, which anyone can edit or craft in a link, so it is NOT trusted.
// Accept only an internal path that starts with exactly one "/".
//
// Accepted:  "/saved", "/articles/some-slug", "/articles?search=react&page=2"
// Rejected:  "https://evil.example", "//evil.example", "/\evil.example", "javascript:...",
//            "saved" (no slash), paths with control characters (browsers strip tabs and
//            newlines, so "/\t/evil.example" would become "//evil.example"), and "/login"
//            itself (it would loop).
// Anything rejected returns `fallback` (the saved page by default; pass null to just test).
export const DEFAULT_RETURN_PATH = '/saved'

export function safeRedirectPath(value, fallback = DEFAULT_RETURN_PATH) {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('\\')) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback
  if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login/'))
    return fallback // never bounce back to login
  return value
}

// "/login?returnTo=%2Fsaved": the login address that remembers where the user wanted to go.
// An unsafe destination is simply left out.
export function loginPathFor(returnTo) {
  const safe = safeRedirectPath(returnTo, null)
  return safe ? `/login?returnTo=${encodeURIComponent(safe)}` : '/login'
}
