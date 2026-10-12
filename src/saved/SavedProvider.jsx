import { useEffect, useRef, useState } from 'react'
import { getSaved, saveArticle, unsaveArticle } from '../api/savedApi'
import { useAuth } from '../auth/useAuth'
import { SavedContext } from './useSaved'

const EMPTY = { status: 'idle', items: [], message: '' }

// Only the fields a list needs; the article detail also carries `content`.
function toSummary(article) {
  const { id, slug, title, excerpt, category, author, readTimeMinutes, publishedAt, accentColor } =
    article
  return { id, slug, title, excerpt, category, author, readTimeMinutes, publishedAt, accentColor }
}

// ONE place owns the saved list: the article page, the saved page and the header all read it
// from here, so they can never disagree. We wait for the server's answer before changing the
// list (no "optimistic" guess to undo). Both calls are safe to repeat, so a lost answer can
// simply be retried.
export function SavedProvider({ children }) {
  const { status: authStatus, token, expireSession } = useAuth()
  const activeToken = authStatus === 'signedIn' ? token : null

  // Everything we hold is tagged with the token it belongs to. When the user signs out, or
  // another user signs in, the tag no longer matches and the old list simply stops counting:
  // nothing has to be "reset" by hand, and nothing can leak to the next user.
  const [loaded, setLoaded] = useState({ forToken: null, status: 'idle', items: [], message: '' })
  const [pendingState, setPendingState] = useState({ forToken: null, ids: [] })
  const [attempt, setAttempt] = useState(0)
  // Refs change immediately (state only after a render): two quick clicks must not send two
  // requests, and an answer that arrives after sign-out must not touch the next user's list.
  const pendingIds = useRef(new Set())
  const currentToken = useRef(activeToken)

  const state =
    loaded.forToken === activeToken && activeToken
      ? loaded
      : { ...EMPTY, status: activeToken ? 'loading' : 'idle' }
  const pending = pendingState.forToken === activeToken ? pendingState.ids : []

  useEffect(() => {
    currentToken.current = activeToken
    pendingIds.current = new Set()
    if (!activeToken) return

    const controller = new AbortController()
    getSaved({ token: activeToken, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        if (!Array.isArray(data?.items)) {
          throw new Error('The server sent a response we could not read.')
        }
        setLoaded({ forToken: activeToken, status: 'ready', items: data.items, message: '' })
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        if (error.kind === 'http' && error.status === 401) {
          expireSession() // the server says this session is over
          return
        }
        setLoaded({ forToken: activeToken, status: 'error', items: [], message: error.message })
      })
    return () => controller.abort()
  }, [activeToken, attempt, expireSession])

  async function run(id, call, apply) {
    const key = String(id)
    const forToken = currentToken.current
    if (!forToken) return { ok: false, kind: 'signedOut' }
    if (pendingIds.current.has(key)) return { ok: false, kind: 'busy' }

    const publishPending = () => setPendingState({ forToken, ids: [...pendingIds.current] })
    pendingIds.current.add(key)
    publishPending()
    try {
      await call({ id, token: forToken })
      if (currentToken.current === forToken) setLoaded((previous) => apply(previous))
      return { ok: true }
    } catch (error) {
      if (error.kind === 'http' && error.status === 401) {
        if (currentToken.current === forToken) expireSession()
        return { ok: false, kind: 'unauthorized' }
      }
      const notFound = error.kind === 'http' && error.status === 404
      return {
        ok: false,
        kind: notFound ? 'notFound' : 'error',
        message: notFound ? 'This article no longer exists.' : error.message,
      }
    } finally {
      if (currentToken.current === forToken) {
        pendingIds.current.delete(key)
        publishPending()
      }
    }
  }

  const savedIds = new Set(state.items.map((item) => String(item.id)))

  const value = {
    status: state.status,
    items: state.items,
    message: state.message,
    isSaved: (id) => savedIds.has(String(id)),
    isPending: (id) => pending.includes(String(id)),
    save: (article) =>
      run(article.id, saveArticle, (previous) =>
        previous.items.some((item) => String(item.id) === String(article.id))
          ? previous
          : { ...previous, items: [toSummary(article), ...previous.items] },
      ),
    remove: (id) =>
      run(id, unsaveArticle, (previous) => ({
        ...previous,
        items: previous.items.filter((item) => String(item.id) !== String(id)),
      })),
    reload: () => {
      setLoaded({ forToken: null, status: 'idle', items: [], message: '' }) // shows "loading" again
      setAttempt((count) => count + 1)
    },
  }
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}
