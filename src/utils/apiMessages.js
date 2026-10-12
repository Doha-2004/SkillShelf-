// Turns an ApiError into one sentence for the user. Pages with special needs (login, reset)
// handle their own statuses first and use this for the rest.
export function describeApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.kind === 'network') return error.message
  if (error?.kind === 'http') {
    if (error.status === 429) return 'Too many attempts. Wait a minute and try again.'
    if (error.status === 400) return error.detail ?? error.title ?? fallback
    if (error.status >= 500) return 'The server had a problem. Please try again in a moment.'
  }
  return fallback
}

// ASP.NET validation problems look like { errors: { NewPassword: ["..."] } }.
// Returns every message whose field name matches `fieldPattern` (case-insensitive).
export function validationMessages(error, fieldPattern) {
  const errors = error?.errors
  if (!errors || typeof errors !== 'object') return []
  return Object.entries(errors)
    .filter(([field]) => fieldPattern.test(field))
    .flatMap(([, messages]) => (Array.isArray(messages) ? messages : [messages]))
    .filter((message) => typeof message === 'string' && message !== '')
}
