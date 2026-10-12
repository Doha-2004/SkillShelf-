import { request } from './apiClient'

// All three need the Bearer token. Saving and removing answer 204 and are safe to repeat.
// The article's numeric `id` goes in the path (not its slug).
export function getSaved({ token, signal } = {}) {
  return request('/api/me/saved', { token, signal })
}

export function saveArticle({ id, token, signal } = {}) {
  return request(`/api/me/saved/${encodeURIComponent(id)}`, { method: 'POST', token, signal })
}

export function unsaveArticle({ id, token, signal } = {}) {
  return request(`/api/me/saved/${encodeURIComponent(id)}`, { method: 'DELETE', token, signal })
}
