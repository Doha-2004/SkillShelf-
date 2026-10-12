import { useEffect, useRef, useState } from 'react'

// Copies the CURRENT address (window.location.href) so the link keeps the search, category,
// sort and page. The address never contains a token: the session lives in localStorage.
// If the browser blocks the clipboard (or it is unavailable), we show the link in a read-only
// field so the person can still select and copy it by hand.
function CopyLinkButton({ label = 'Copy link' }) {
  const [state, setState] = useState('idle') // idle | copied | failed
  const [url, setUrl] = useState('')
  const timer = useRef(null)
  const field = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (state === 'failed') field.current?.select()
  }, [state])

  async function copy() {
    const href = window.location.href
    setUrl(href)
    clearTimeout(timer.current)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(href)
      setState('copied')
      timer.current = setTimeout(() => setState('idle'), 3000)
    } catch {
      setState('failed')
    }
  }

  return (
    <div className="copy-link">
      <button type="button" onClick={copy}>
        {label}
      </button>
      <div aria-live="polite" className="copy-link-status">
        {state === 'copied' && <p className="field-message is-ok">Link copied.</p>}
        {state === 'failed' && (
          <p className="field-message is-error">
            Could not copy automatically. Select the link below and copy it.
          </p>
        )}
      </div>
      {state === 'failed' && (
        <input
          ref={field}
          className="copy-link-field"
          readOnly
          value={url}
          aria-label="Link to this page"
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  )
}

export default CopyLinkButton
