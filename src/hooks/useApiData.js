import { useEffect, useState } from 'react'

// Runs `fetcher(signal)` and tracks its state: loading -> success | error.
//
// - `deps` works like useEffect's dependency list: when one changes, the
//   request runs again.
// - When deps change (or the component unmounts) the previous request is
//   aborted, so an old response can never overwrite a newer one.
//   The `signal.aborted` checks are a second line of defence for a response
//   that had already arrived when the abort happened.
// - `reload()` re-runs the request (used by the "Try again" button).
export function useApiData(fetcher, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading', data: null, error: null })

    fetcher(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return // outdated response: ignore it
        setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState({ status: 'error', data: null, error })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, reload: () => setAttempt((n) => n + 1) }
}
