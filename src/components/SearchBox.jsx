import { useEffect, useRef, useState } from 'react'
import { SEARCH_MAX_LENGTH } from '../utils/catalogParams'

export const SEARCH_DEBOUNCE_MS = 400

// `value` is the search currently in the URL (the source of truth).
// While the user types we keep a local `draft`, and only tell the parent
// (`onSearch`) after they pause: one request per pause, not one per key.
function SearchBox({ value, onSearch }) {
  const [draft, setDraft] = useState(value)
  const timer = useRef(null)
  // The last value we sent to the URL. It lets us tell "the URL changed because of
  // us" apart from "the URL changed from outside" (Clear filters, Back button).
  const lastSent = useRef(value)

  useEffect(() => {
    if (value !== lastSent.current) {
      // Changed from outside: show it in the box and drop any pending send.
      lastSent.current = value
      clearTimeout(timer.current)
      setDraft(value)
    }
  }, [value])

  useEffect(() => () => clearTimeout(timer.current), [])

  function send(text) {
    clearTimeout(timer.current)
    const normalized = text.trim()
    if (normalized === lastSent.current) return // nothing really changed: no new request
    lastSent.current = normalized
    onSearch(normalized)
  }

  function handleChange(event) {
    const text = event.target.value
    setDraft(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => send(text), SEARCH_DEBOUNCE_MS)
  }

  function handleSubmit(event) {
    event.preventDefault()
    send(draft) // Enter searches immediately
  }

  return (
    <form role="search" className="filter" onSubmit={handleSubmit}>
      <label htmlFor="search-input">Search articles</label>
      <input
        id="search-input"
        type="search"
        value={draft}
        maxLength={SEARCH_MAX_LENGTH}
        onChange={handleChange}
        placeholder="Title or excerpt"
      />
    </form>
  )
}

export default SearchBox
