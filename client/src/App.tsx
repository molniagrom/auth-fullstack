import { useEffect, useState } from 'react'
import { getAuthSession, subscribeToAuthSession } from './api/authSession'
import { RegistrationForm } from './components/RegistrationForm'
import { AuthorizationPlayground } from './components/AuthorizationPlayground'
import { ProtectedPage } from './components/ProtectedPage'
import { VerifyEmailForm } from './components/VerifyEmailForm'
import './App.css'

type ViewMode = 'register' | 'authorization' | 'protected' | 'verify'

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [authSession, setAuthSession] = useState(getAuthSession())
  const viewMode = getViewMode(pathname)
  const pageContent = getPageContent(viewMode, Boolean(authSession.user && authSession.accessToken))

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    return subscribeToAuthSession(() => {
      setAuthSession(getAuthSession())
    })
  }, [])

  function navigateTo(nextPathname: string) {
    if (window.location.pathname === nextPathname) {
      return
    }

    window.history.pushState({}, '', nextPathname)
    setPathname(nextPathname)
  }

  return (
    <main className="page-shell">
      <header className="panel app-header">
        <div>
          <p className="eyebrow">Auth Fullstack</p>
          <h1>{pageContent.title}</h1>
        </div>

        <nav className="menu-nav" aria-label="Primary">
          <button
            className={viewMode === 'register' ? 'menu-link active' : 'menu-link'}
            type="button"
            onClick={() => navigateTo('/')}
          >
            Registration
          </button>
          <button
            className={viewMode === 'authorization' ? 'menu-link active' : 'menu-link'}
            type="button"
            onClick={() => navigateTo('/authorization')}
          >
            Authorization
          </button>
          <button
            className={viewMode === 'protected' ? 'menu-link active' : 'menu-link'}
            type="button"
            onClick={() => navigateTo('/protected')}
          >
            Protected
          </button>
          <button
            className={viewMode === 'verify' ? 'menu-link active' : 'menu-link'}
            type="button"
            onClick={() => navigateTo('/verify-email')}
          >
            Verify Email
          </button>
        </nav>
      </header>

      <section className="panel hero-panel">
        <p className="eyebrow">{pageContent.eyebrow}</p>
        <h2>{pageContent.heading}</h2>
        <p className="lead">{pageContent.description}</p>
      </section>

      {viewMode === 'register' ? <RegistrationForm /> : null}
      {viewMode === 'authorization' ? <AuthorizationPlayground /> : null}
      {viewMode === 'protected' ? (
        <ProtectedPage onNavigateToAuthorization={() => navigateTo('/authorization')} />
      ) : null}
      {viewMode === 'verify' ? <VerifyEmailForm /> : null}
    </main>
  )
}

export default App

function getViewMode(pathname: string): ViewMode {
  if (pathname === '/verify-email') {
    return 'verify'
  }

  if (pathname === '/authorization') {
    return 'authorization'
  }

  if (pathname === '/protected') {
    return 'protected'
  }

  return 'register'
}

function getPageContent(viewMode: ViewMode, isAuthenticated: boolean) {
  if (viewMode === 'authorization') {
    return {
      title: 'Authorization',
      eyebrow: 'JWT Flow',
      heading: 'Access token and refresh token learning flow',
      description:
        'Use this page to log in, call protected routes, refresh tokens, and see how the client stores the access token in memory while the browser stores the refresh token in an httpOnly cookie.',
    }
  }

  if (viewMode === 'protected') {
    return isAuthenticated
      ? {
          title: 'Protected Page',
          eyebrow: 'Route Guard',
          heading: 'This page is visible only for an authenticated client session',
          description:
            'The client checks whether it has a logged-in user and an access token in memory. If both exist, the protected page is rendered and can call protected backend endpoints.',
        }
      : {
          title: 'Protected Page',
          eyebrow: 'Route Guard',
          heading: 'You need to log in before entering this page',
          description:
            'Right now the client does not have an authenticated session in memory, so the route guard blocks protected content and asks you to go through the authorization page first.',
        }
  }

  if (viewMode === 'verify') {
    return {
      title: 'Verify Email',
      eyebrow: 'Email Verification',
      heading: 'Confirm the email from the backend verification link',
      description:
        'This page reads email and code from the URL query string, sends them to the backend, and lets you request a new verification code if the old one is stale.',
    }
  }

  return {
    title: 'Registration',
    eyebrow: 'Registration Flow',
    heading: 'Create a user before moving into authorization',
    description:
      'This project does not send real emails. The backend logs a verification link to the console through an SMTP mock adapter, and after verification the same account can be used in the authorization page.',
  }
}
