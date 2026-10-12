import { Link, useLocation, useParams } from 'react-router-dom'
import { getArticle } from '../api/articlesApi'
import { useCategories } from '../context/useCategories'
import { useApiData } from '../hooks/useApiData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import CopyLinkButton from '../components/CopyLinkButton'
import SaveButton from '../components/SaveButton'
import { formatDate } from '../utils/formatDate'

// The article `content` is plain text: paragraphs are separated by a blank line.
// We render it as <p> elements (never as HTML), so nothing in it can run as code.
function splitParagraphs(content) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// The catalog link may carry the list's query string (see ArticleCard).
// location.state is not trusted blindly: we accept only a string that looks like a query.
function readCatalogSearch(state) {
  const value = state?.catalogSearch
  return typeof value === 'string' && value.startsWith('?') ? value : ''
}

function ArticlePage() {
  const { slug } = useParams()
  const location = useLocation()
  const { categories } = useCategories()
  const article = useApiData((signal) => getArticle(slug, { signal }), [slug])

  useDocumentTitle(
    article.status === 'success' ? `${article.data.title} – SkillShelf` : 'Article – SkillShelf',
  )

  const backLink = (
    <p className="back-link">
      <Link to={{ pathname: '/articles', search: readCatalogSearch(location.state) }}>
        ← Back to articles
      </Link>
    </p>
  )

  if (article.status === 'loading') {
    return (
      <>
        {backLink}
        <p role="status">Loading article…</p>
      </>
    )
  }

  if (article.status === 'error') {
    // 404 is an expected situation (wrong or old link), not a failure of the app.
    if (article.error.kind === 'http' && article.error.status === 404) {
      return (
        <>
          {backLink}
          <h1>Article not found</h1>
          <p>This article does not exist or the link is wrong.</p>
        </>
      )
    }
    return (
      <>
        {backLink}
        <div role="alert">
          <p>We could not load this article. {article.error.message}</p>
          <button type="button" className="button-primary" onClick={article.reload}>
            Try again
          </button>
        </div>
      </>
    )
  }

  const { title, category, author, readTimeMinutes, publishedAt, content } = article.data
  const categoryName = categories.find((item) => item.id === category)?.name ?? category

  return (
    <>
      {backLink}
      <article className="article">
        <p className="card-category">{categoryName}</p>
        <h1>{title}</h1>
        <p className="card-meta">
          {author} · {readTimeMinutes} min read ·{' '}
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </p>
        <div className="article-actions">
          <SaveButton article={article.data} />
          <CopyLinkButton label="Copy article link" />
        </div>
        <div className="article-body">
          {/* Index keys are fine here: the paragraphs never reorder or change. */}
          {splitParagraphs(content).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </>
  )
}

export default ArticlePage
