import axios from 'axios'
import { API_BASE_URL } from '../config'

// One error type for everything that can go wrong with a request.
// `kind` tells the UI which situation it is dealing with:
//   'network' -> the request never got an answer (offline, CORS, DNS, server down)
//   'http'    -> the server answered with a non-2xx status (400, 401, 404, 429, 500...)
//   'parse'   -> the server answered 2xx but the body was not valid JSON
export class ApiError extends Error {
  constructor({ kind, status = null, title = null, detail = null, message }) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.title = title
    this.detail = detail
  }
}

// Build a full URL and let URLSearchParams encode the values safely
// (spaces, &, #, Arabic letters...). Empty values are skipped, so
// `search: ''` does not produce `?search=`.
function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

// One shared axios instance. We switch off axios's own "throw on non-2xx" and "parse the JSON"
// behaviour on purpose: this file decides what each status means and how a body is read,
// so every page keeps the same ApiError rules no matter which HTTP library sits underneath.
export const http = axios.create({
  responseType: 'text', 
  transformResponse: [(data) => data],
  validateStatus: () => true,
})

// Error bodies are usually ProblemDetails JSON, but we never assume it:
// read as text first, then try to parse.
function readProblem(text) {
  try {
    const data = JSON.parse(text)
    return {
      title: typeof data?.title === 'string' ? data.title : null,
      detail: typeof data?.detail === 'string' ? data.detail : null,
    }
  } catch {
    return { title: null, detail: null }
  }
}

export async function request(path, { method = 'GET', query, body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await http.request({
      url: buildUrl(path, query).toString(),
      method,
      headers,
      data: body, // axios sends objects as JSON with the right Content-Type
      signal,
    })
  } catch (error) {
    // A cancelled request is not a failure: let the caller recognise it.
    if (axios.isCancel(error) || error?.name === 'AbortError') {
      throw new DOMException('The request was cancelled.', 'AbortError')
    }
    throw new ApiError({
      kind: 'network',
      message: 'Could not reach the server. Check your connection and try again.',
    })
  }

  const text = typeof response.data === 'string' ? response.data : ''

  if (response.status < 200 || response.status >= 300) {
    const { title, detail } = readProblem(text)
    throw new ApiError({
      kind: 'http',
      status: response.status,
      title,
      detail,
      message: detail ?? title ?? `Request failed with status ${response.status}`,
    })
  }

  // 204 No Content (logout, save, unsave) has no body at all.
  if (response.status === 204) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError({
      kind: 'parse',
      status: response.status,
      message: 'The server sent a response we could not read.',
    })
  }
}
