import { parsePage } from './parsePage'

// Values allowed by the API contract.
export const PAGE_SIZES = [6, 12, 24]
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'title', label: 'Title (A–Z)' },
]
export const DEFAULT_PAGE_SIZE = 6
export const DEFAULT_SORT = 'newest'
export const SEARCH_MAX_LENGTH = 100

// Turns the URL into a clean, validated set of catalog settings.
// The URL is user input, so every value is checked and falls back to a default.
export function parseCatalogParams(searchParams) {
  const rawPageSize = searchParams.get('pageSize')
  const rawSort = searchParams.get('sort')

  return {
    page: parsePage(searchParams.get('page')),
    pageSize: PAGE_SIZES.find((size) => String(size) === rawPageSize) ?? DEFAULT_PAGE_SIZE,
    sort: SORT_OPTIONS.some((option) => option.value === rawSort) ? rawSort : DEFAULT_SORT,
    category: (searchParams.get('category') ?? '').trim(),
    search: (searchParams.get('search') ?? '').trim().slice(0, SEARCH_MAX_LENGTH).trim(),
  }
}

// Search and category narrow the results; sort and page size only change the view.
export function hasActiveFilters(filters) {
  return filters.search !== '' || filters.category !== ''
}

// Values equal to their default are left out of the URL, so links stay short.
const DEFAULTS = { search: '', category: '', sort: DEFAULT_SORT, pageSize: DEFAULT_PAGE_SIZE }

// Returns a new URLSearchParams with `changes` applied.
// Any change to the filters, sort or page size sends the user back to page 1:
// page 3 of the old results means nothing in the new results.
export function applyFilterChanges(current, changes) {
  const next = new URLSearchParams(current) // keep unrelated params
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === null || String(value) === String(DEFAULTS[key] ?? '')) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
  }
  next.delete('page')
  return next
}
