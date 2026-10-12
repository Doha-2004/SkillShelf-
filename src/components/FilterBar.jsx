import { PAGE_SIZES, SORT_OPTIONS } from '../utils/catalogParams'
import SearchBox from './SearchBox'

// Presentational: shows the current settings and reports changes via `onChange`.
function FilterBar({ filters, categories, onChange, onClear, canClear }) {
  // If the URL names a category we do not know (yet), keep it as an option so
  // the select does not silently show "All categories".
  const knownCategory = categories.some((category) => category.id === filters.category)

  return (
    <div className="filter-bar">
      <SearchBox value={filters.search} onSearch={(search) => onChange({ search })} />

      <div className="filter">
        <label htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
        >
          <option value="">All categories</option>
          {filters.category && !knownCategory && (
            <option value={filters.category}>{filters.category}</option>
          )}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label htmlFor="sort-select">Sort by</label>
        <select
          id="sort-select"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label htmlFor="page-size-select">Per page</label>
        <select
          id="page-size-select"
          value={filters.pageSize}
          onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {canClear && (
        <button type="button" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  )
}

export default FilterBar
