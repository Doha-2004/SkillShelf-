import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// Shown for any URL that matches no route, e.g. /nothing-here
function NotFoundPage() {
  useDocumentTitle('Page not found – SkillShelf')
  return (
    <>
      <h1>Page not found</h1>
      <p>
        <Link to="/articles">Go to the article list</Link>
      </p>
    </>
  )
}

export default NotFoundPage
