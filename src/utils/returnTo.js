// Builds the login URL that remembers where the user wanted to go:
//   loginPath('/saved')  ->  "/login?returnTo=%2Fsaved"
// The destination (including its own query string) is encoded as ONE value, so
// "/articles?page=2&sort=title" survives as a single parameter.
export function loginPath(returnTo) {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`
}
