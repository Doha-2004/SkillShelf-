import { request } from './apiClient'

// Public content endpoints. Components call these functions instead of
// writing URLs, so a path or parameter name lives in exactly one place.

// -> [{ id: 'css', name: 'CSS' }, ...]   (shape verified against the live API)
export function getCategories({ signal } = {}) {
  return request('/api/categories', { signal })
}

// -> { items, page, pageSize, totalItems, totalPages, hasPreviousPage, hasNextPage }
// Allowed values (from the API contract): pageSize 6 | 12 | 24, sort 'newest' | 'title'.
export function getArticles({ page, pageSize, search, category, sort, signal } = {}) {
  return request('/api/articles', {
    query: { page, pageSize, search, category, sort },
    signal,
  })
}

// -> the full article, including `content` (plain text, paragraphs separated by a blank line).
// Rejects with ApiError { kind: 'http', status: 404 } when the slug does not exist.
// A slug is user input (it comes from the URL), so it is encoded before it goes into the path:
// "a/b" must not become two path segments.
export function getArticle(slug, { signal } = {}) {
  return request(`/api/articles/${encodeURIComponent(slug)}`, { signal })
}
