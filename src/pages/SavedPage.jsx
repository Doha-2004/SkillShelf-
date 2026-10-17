import { useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { useCategories } from '../context/useCategories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSaved } from '../saved/useSaved'

// The signed-in user's saved articles, from the shared saved list (see SavedProvider).
// ProtectedRoute already made sure the user is signed in; a 401 from the server clears the
// session and ProtectedRoute sends the user to /login?returnTo=%2Fsaved.
function SavedPage() {
  const saved = useSaved()
  const { categories } = useCategories()
  const [feedback, setFeedback] = useState(null) 
  useDocumentTitle('Saved articles – SkillShelf')

  const categoryNames = Object.fromEntries(categories.map((item) => [item.id, item.name]))

  async function handleRemove(article) {
    setFeedback(null)
    const result = await saved.remove(article.id)
    if (result.ok) {
      setFeedback({ tone: 'ok', text: `Removed “${article.title}” from your saved articles.` })
    } else if (result.kind !== 'unauthorized' && result.kind !== 'busy') {
      setFeedback({
        tone: 'error',
        text: `Could not remove “${article.title}”. ${result.message ?? ''}`,
      })
    }
  }

  function renderContent() {
    if (saved.status === 'idle' || saved.status === 'loading') {
      return <p role="status">Loading your saved articles…</p>
    }

    if (saved.status === 'error') {
      return (
        <div role="alert">
          <p>We could not load your saved articles. {saved.message}</p>
          <button type="button" className="button-primary" onClick={saved.reload}>
            Try again
          </button>
        </div>
      )
    }

    if (saved.items.length === 0) {
      return (
        <div className="empty-state">
          <p className="empty-title">You have not saved any articles yet.</p>
          <p>Open an article and choose “Save article” to keep it here.</p>
          <p>
            <Link to="/articles">Browse articles</Link>
          </p>
        </div>
      )
    }

    return (
      <ul className="card-list">
        {saved.items.map((article) => (
          <li key={article.id}>
            <ArticleCard
              article={article}
              categoryName={categoryNames[article.category] ?? article.category}
              actions={
                <button
                  type="button"
                  disabled={saved.isPending(article.id)}
                  onClick={() => handleRemove(article)}
                  aria-label={`Remove “${article.title}” from saved`}
                >
                  {saved.isPending(article.id) ? 'Removing…' : 'Remove'}
                </button>
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <>
      <div className="page-intro">
        <h1>Saved articles</h1>
        {saved.status === 'ready' && saved.items.length > 0 && (
          <p>
            {saved.items.length} saved {saved.items.length === 1 ? 'article' : 'articles'}.
          </p>
        )}
      </div>
      <div aria-live="polite">
        {feedback && (
          <p className={`field-message ${feedback.tone === 'ok' ? 'is-ok' : 'is-error'}`}>
            <span aria-hidden="true" className="field-icon">
              {feedback.tone === 'ok' ? '✓' : '!'}
            </span>
            {feedback.text}
          </p>
        )}
      </div>
      {renderContent()}
    </>
  )
}

export default SavedPage
