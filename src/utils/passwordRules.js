// Password policy from the API contract (reset-password): 8-128 characters with at least one
// uppercase letter, one lowercase letter and one digit. This is for CHOOSING a new password.
// It must never be applied to the login form: the server decides what an existing password is.
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  },
  { id: 'upper', label: 'An uppercase letter', test: (value) => /\p{Lu}/u.test(value) },
  { id: 'lower', label: 'A lowercase letter', test: (value) => /\p{Ll}/u.test(value) },
  { id: 'digit', label: 'A number', test: (value) => /\d/.test(value) },
]

// Returns every rule with `met`, and `valid` (all rules met).
export function checkPassword(value) {
  const password = String(value ?? '')
  const rules = PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, met: test(password) }))
  return { rules, valid: rules.every((rule) => rule.met) }
}
