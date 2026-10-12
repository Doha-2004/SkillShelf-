// Presentational: it does not fetch anything. It only shows the API's
// pagination metadata and tells the parent which page the user asked for.
function Pagination({ page, totalPages, hasPreviousPage, hasNextPage, onPageChange }) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={!hasPreviousPage} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}

export default Pagination
