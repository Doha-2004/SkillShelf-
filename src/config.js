// The one place that reads environment settings.
// Other files import API_BASE_URL from here instead of touching import.meta.env.

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!rawBaseUrl) {
  // Fail loudly at startup: a clear message is better than mysterious 404s later.
  throw new Error(
    'Missing VITE_API_BASE_URL. Copy .env.example to .env and restart the dev server.',
  )
}

// Remove trailing slashes so we can always write `${API_BASE_URL}/api/...`.
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')
