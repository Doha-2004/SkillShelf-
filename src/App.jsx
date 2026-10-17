import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import { AuthProvider } from './auth/AuthProvider'
import SiteHeader from './components/SiteHeader'
import { CategoriesProvider } from './context/CategoriesProvider'
import { SavedProvider } from './saved/SavedProvider'
import ArticlePage from './pages/ArticlePage'
import CatalogPage from './pages/CatalogPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import SavedPage from './pages/SavedPage'
import ResetTokenPage from './pages/ResetTokenPage'

// "/" is not a page of its own: it leads to the catalog. Old shared links such as
// "/?search=react" keep their query string.
function RedirectToArticles() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/articles', search }} replace />
}

function App() {
  // A router change does not scroll by itself: without this, opening an article from the
  // bottom of the list would show the bottom of the article. Only the path matters, so
  // searching or paging inside the catalog does not trigger it.
  // Keyboard and screen-reader users also need to land on the new page: without this, focus
  // stays on the link they clicked, which may no longer exist. (Skipped on the first load.)
  const { pathname } = useLocation()
  const previousPath = useRef(null)
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const previous = previousPath.current
    previousPath.current = pathname
    // Not on the first load, and not for the automatic "/" -> "/articles" redirect.
    if (previous === null || previous === '/') return
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <AuthProvider>
      <SavedProvider>
        <CategoriesProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          <div className="container">
            <main id="main" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<RedirectToArticles />} />
                <Route path="/articles" element={<CatalogPage />} />
                <Route path="/articles/:slug" element={<ArticlePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <SavedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/me"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-token" element={<ResetTokenPage />} />
                 <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </CategoriesProvider>
      </SavedProvider>
    </AuthProvider>
  )
}

export default App