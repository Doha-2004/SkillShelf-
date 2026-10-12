// A deliberately LENIENT format check: "something@something.something", no spaces, one "@".
// It only catches typos such as "sara", "sara@" or "sara@example". The server remains the
// judge of whether an address really exists or is allowed, so we never reject unusual but
// valid addresses (for example "name+tag@sub.example.co").
export const EMAIL_MAX_LENGTH = 254

export function isValidEmail(value) {
  const email = String(value ?? '').trim()
  if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return false
  return /^[^\s@]+@[^\s@.][^\s@]*\.[^\s@.]+$/.test(email)
}
