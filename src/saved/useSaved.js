import { createContext, useContext } from 'react'

// What `useSaved()` returns (the saved list of the signed-in user, loaded once for the whole app):
//   status        'idle' (signed out) | 'loading' | 'ready' | 'error'
//   items         article summaries, as the server sent them (newest additions first)
//   message       the error text when status is 'error'
//   isSaved(id)   is this article in the list?
//   isPending(id) is a save/remove request for this article running right now?
//   save(article) / remove(id)
//                 resolve to { ok: true } or { ok: false, kind, message? } where kind is
//                 'signedOut' | 'busy' | 'unauthorized' | 'notFound' | 'error'.
//                 'unauthorized' means the server rejected the token: the session is already
//                 cleared, the caller only has to send the user to the login page.
//   reload()      try loading the list again after an error
export const SavedContext = createContext(null)

export function useSaved() {
  const value = useContext(SavedContext)
  if (!value) throw new Error('useSaved must be used inside <SavedProvider>')
  return value
}
