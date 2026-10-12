import { useEffect } from 'react'

// Sets the browser tab title. It matters for users of screen readers (the title is
// announced on page change), for browser history, and for bookmarks.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}
