import { createContext, useContext } from 'react'

// The context object and the hook that reads it. The provider component lives in
// CategoriesProvider.jsx (a file that exports components should export only components).
export const CategoriesContext = createContext(null)

export function useCategories() {
  const value = useContext(CategoriesContext)
  if (!value) throw new Error('useCategories must be used inside <CategoriesProvider>')
  return value
}
