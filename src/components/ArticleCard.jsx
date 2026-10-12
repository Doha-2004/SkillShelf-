import { Link } from 'react-router-dom'
import { categoryTone } from '../utils/categoryTone'
import { formatDate } from '../utils/formatDate'

// Presentational component: receives data through props and only renders it.
// React escapes text automatically, so API strings are safe to render
// (we never use dangerouslySetInnerHTML).
//
// `catalogSearch` is the catalog's current query string (e.g. "?search=react&page=2").
// It travels with the link so the article page can lead back to the same list.
function ArticleCard({ article, categoryName, catalogSearch = '', actions = null }) {
  return (
    <article className={`card tone-${categoryTone(article.category)}`}>
      <p className="card-category">{categoryName}</p>
      <h2 className="card-title">
        <Link to={`/articles/${encodeURIComponent(article.slug)}`} state={{ catalogSearch }}>
          {article.title}
        </Link>
      </h2>
      <p className="card-excerpt">{article.excerpt}</p>
      <p className="card-meta">
        {article.author} · {article.readTimeMinutes} min read ·{' '}
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      {actions && <div className="card-actions">{actions}</div>}
    </article>
  )
}

export default ArticleCard
