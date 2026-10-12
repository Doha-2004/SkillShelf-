import { Navigate, useSearchParams } from 'react-router-dom'
import { getArticles } from '../api/articlesApi'
import ArticleCard from '../components/ArticleCard'
import CopyLinkButton from '../components/CopyLinkButton'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import { useCategories } from '../context/useCategories'
import { useApiData } from '../hooks/useApiData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { applyFilterChanges, hasActiveFilters, parseCatalogParams } from '../utils/catalogParams'

function CatalogPage() {
  // The URL is the source of truth for everything the user can change:
  // refresh, back/forward and shared links all restore the same view.
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseCatalogParams(searchParams)
  const { page, pageSize, sort, category, search } = filters

  // Only simple values in the deps list (numbers and strings), never objects:
  // a new object on every render would re-run the request forever.
  const articles = useApiData(
    (signal) => getArticles({ page, pageSize, search, category, sort, signal }),
    [page, pageSize, search, category, sort],
  )
  // Loaded once for the whole app (see CategoriesProvider), not once per page.
  const { categories: categoryList } = useCategories()
  useDocumentTitle('Articles – SkillShelf')

  // The query string of this list. Article links carry it so "Back to articles" returns here.
  const catalogSearch = searchParams.toString() ? `?${searchParams.toString()}` : ''

  // Article cards store the category id ("css"); the UI shows its name ("CSS").
  // If categories fail to load we fall back to the id: the articles still matter more.
  const categoryNames = Object.fromEntries(categoryList.map((item) => [item.id, item.name]))

  function updateFilters(changes) {
    setSearchParams((previous) => applyFilterChanges(previous, changes))
  }

  function clearFilters() {
    updateFilters({ search: '', category: '' }) // sort and page size are view choices: kept
  }

  function goToPage(nextPage) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous) // keep every other param
      if (nextPage === 1)
        next.delete('page') // page 1 = clean URL
      else next.set('page', String(nextPage))
      return next
    })
    window.scrollTo({ top: 0 })
  }

  function renderResults() {
    if (articles.status === 'loading') {
      // Skeleton cards keep the page height steady while loading (no layout jump).
      // Screen readers get one short message; the grey boxes are hidden from them.
      return (
        <div role="status" aria-busy="true" className="loading-state">
          <span className="visually-hidden">Loading articles…</span>
          <ul className="card-list" aria-hidden="true">
            {Array.from({ length: pageSize > 6 ? 6 : pageSize }, (_, index) => (
              <li key={index} className="card skeleton">
                <span className="skeleton-line short" />
                <span className="skeleton-line title" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (articles.status === 'error') {
      return (
        <div role="alert">
          <p>We could not load the articles. {articles.error.message}</p>
          <button type="button" className="button-primary" onClick={articles.reload}>
            Try again
          </button>
        </div>
      )
    }

    const { items, totalItems, totalPages } = articles.data

    // Out of range (e.g. ?page=99): the API answers 200 with no items.
    // Send the user to the last real page, keeping their filters.
    if (items.length === 0 && totalItems > 0 && page > totalPages) {
      const next = new URLSearchParams(searchParams)
      if (totalPages === 1) next.delete('page')
      else next.set('page', String(totalPages))
      const query = next.toString()
      return <Navigate to={{ search: query ? `?${query}` : '' }} replace />
    }

    if (items.length === 0) {
      // "Clear filters" is already shown in the filter bar whenever filters are active.
      return hasActiveFilters(filters) ? (
        <div className="empty-state">
          <p className="empty-title">No articles match your search or filters.</p>
          <p>Try a different word, or use “Clear filters” above to see every article.</p>
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-title">No articles found.</p>
          <p>There is nothing in the catalog yet. Please check back later.</p>
        </div>
      )
    }

    return (
      <>
        <p className="results-summary" aria-live="polite">
          Showing {items.length} of {totalItems} articles
        </p>
        <ul className="card-list">
          {items.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                categoryName={categoryNames[article.category] ?? article.category}
                catalogSearch={catalogSearch}
              />
            </li>
          ))}
        </ul>
        <Pagination
          page={articles.data.page}
          totalPages={totalPages}
          hasPreviousPage={articles.data.hasPreviousPage}
          hasNextPage={articles.data.hasNextPage}
          onPageChange={goToPage}
        />
      </>
    )
  }

  // FilterBar is always rendered. If it disappeared while loading, the search box
  // would be removed from the page on every keystroke and the user would lose focus.
  return (
    <>
      <div className="page-intro">
        <h1>Articles</h1>
        <p>Browse by topic, search by title, and sort to decide what to read next.</p>
      </div>
      <FilterBar
        filters={filters}
        categories={categoryList}
        onChange={updateFilters}
        onClear={clearFilters}
        canClear={hasActiveFilters(filters)}
      />
      <CopyLinkButton label="Copy link to this list" />
      {renderResults()}
    </>
  )
}

export default CatalogPage
