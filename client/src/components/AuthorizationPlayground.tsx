import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { api } from '../api/authApi'
import { getErrorMessage } from '../api/client'
import { getAuthSession, subscribeToAuthSession } from '../api/authSession'
import { StatusMessage } from './StatusMessage'

export function AuthorizationPlayground() {
  const [authSession, setAuthSession] = useState(getAuthSession())
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    return subscribeToAuthSession(() => {
      setAuthSession(getAuthSession())
    })
  }, [])

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthLoading(true)
    resetFeedback()

    try {
      await api.login({
        email: loginEmail,
        password: loginPassword,
      })

      setAuthMessage(
        'Login succeeded. The access token is stored in client memory, and the refresh token is now in an httpOnly cookie.',
      )
      setLoginPassword('')
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Login failed.'))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLoadCurrentUser() {
    setAuthLoading(true)
    resetFeedback()

    try {
      await api.getCurrentUser()
      setAuthMessage('Protected request succeeded with the current access token.')
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Protected request failed.'))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLoadCurrentUserWithRefresh() {
    setAuthLoading(true)
    resetFeedback()

    try {
      await api.getCurrentUserWithRefreshRetry()
      setAuthMessage(
        'The client retried the protected request after calling POST /auth/refresh and storing the rotated access token.',
      )
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Refresh flow failed.'))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleManualRefresh() {
    setAuthLoading(true)
    resetFeedback()

    try {
      await api.refresh()
      setAuthMessage('Refresh succeeded. The backend rotated the refresh session and returned a new access token.')
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Manual refresh failed.'))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    setAuthLoading(true)
    resetFeedback()

    try {
      const data = await api.logout()
      setAuthMessage(data.message)
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Logout failed.'))
    } finally {
      setAuthLoading(false)
    }
  }

  function resetFeedback() {
    setAuthMessage('')
    setAuthError('')
  }

  return (
    <section className="panel form-panel">
      <div className="panel-copy">
        <p className="section-label">AuthorizationPlayground</p>
        <h2>JWT authorization flow</h2>
        <p>
          This panel follows <code>docs/authorization</code>: login returns an
          in-memory access token, the browser keeps the refresh token in an
          httpOnly cookie, and protected requests can be retried through the
          refresh endpoint.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleLoginSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="student@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Your verified account password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={authLoading}>
          {authLoading ? 'Working...' : 'Login'}
        </button>
      </form>

      <div className="action-grid">
        <button className="secondary-button" type="button" onClick={handleLoadCurrentUser} disabled={authLoading}>
          Call GET /auth/me
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={handleLoadCurrentUserWithRefresh}
          disabled={authLoading}
        >
          Retry me with refresh
        </button>
        <button className="secondary-button" type="button" onClick={handleManualRefresh} disabled={authLoading}>
          Call POST /auth/refresh
        </button>
        <button className="secondary-button" type="button" onClick={handleLogout} disabled={authLoading}>
          Call POST /auth/logout
        </button>
      </div>

      <StatusMessage tone="success" message={authMessage} />
      <StatusMessage tone="error" message={authError} />

      <dl className="link-details">
        <div>
          <dt>Access token in memory</dt>
          <dd>{authSession.accessToken || 'Empty until login or refresh'}</dd>
        </div>
        <div>
          <dt>Current user from backend</dt>
          <dd>{authSession.user ? JSON.stringify(authSession.user, null, 2) : 'No authenticated user loaded yet'}</dd>
        </div>
      </dl>
    </section>
  )
}
