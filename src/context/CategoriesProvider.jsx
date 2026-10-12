import { getCategories } from '../api/articlesApi'
import { useApiData } from '../hooks/useApiData'
import { CategoriesContext } from './useCategories'

// Why a context here? The category list is needed on more than one page
// (catalog filter, article page) and it practically never changes.
// Fetching it once at the top avoids a duplicate request on every page change.
// Nothing else is shared this way: state that only one page needs stays in that page.
export function CategoriesProvider({ children }) {
  const result = useApiData((signal) => getCategories({ signal }), [])
  // While loading or after a failure the list is empty: pages fall back to the category id.
  const value = { categories: result.data ?? [], status: result.status }
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}
