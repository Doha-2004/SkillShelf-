import { request } from './apiClient'

// -> { accessToken, tokenType, expiresAt, user: { id, name, email } }
// Rejects with ApiError { kind: 'http', status: 400 | 401 | 429 }.
export function login({ email, password, signal }) {
  return request('/api/auth/login', { method: 'POST', body: { email, password }, signal })
}

// -> { id, name, email }. 401 means the token is missing, expired or revoked.
export function getMe({ token, signal }) {
  return request('/api/auth/me', { token, signal })
}

// -> null (204). Revokes the session on the server.
export function logout({ token, signal }) {
  return request('/api/auth/logout', { method: 'POST', token, signal })
}

// -> { message }. Always the same answer, whether or not the account exists.
// Rejects with ApiError { kind: 'http', status: 400 | 429 }.
export function forgotPassword({ email, signal }) {
  return request('/api/auth/forgot-password', { method: 'POST', body: { email }, signal })
}

// -> { message }. 400 = invalid / expired / already used link, or a password the server rejects.
// A successful reset revokes every session of the account on the server.
export function resetPassword({ email, token, newPassword, signal }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: { email, token, newPassword },
    signal,
  })
}
