import { useState } from 'react'

import { api } from '../api/authApi'
import { getErrorMessage } from '../api/client'
import { getAuthSession } from '../api/authSession'
import { StatusMessage } from './StatusMessage'

type ProtectedPageProps = {
  onNavigateToAuthorization: () => void
}

export function ProtectedPage(props: ProtectedPageProps) {
  const authSession = getAuthSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [serverUserSnapshot, setServerUserSnapshot] = useState<string>('')

  if (!authSession.user || !authSession.accessToken) {
    return (
      <section className="panel form-panel">
        <div className="panel-copy">
          <p className="section-label">ProtectedPage</p>
          <h2>Protected content is locked</h2>
          <p>
            This page is available only for authenticated users. First log in on
            the authorization page so the client gets an access token in memory.
          </p>
        </div>

        <button className="primary-button" type="button" onClick={props.onNavigateToAuthorization}>
          Go to authorization page
        </button>
      </section>
    )
  }

  async function handleLoadProtectedData() {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const user = await api.getCurrentUserWithRefreshRetry()
      setServerUserSnapshot(JSON.stringify(user, null, 2))
      setMessage('Protected page successfully loaded current user data from GET /auth/me.')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Protected request failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-copy">
        <p className="section-label">ProtectedPage</p>
        <h2>Authenticated area</h2>
        <p>
          You reached this page because the client currently has an authenticated
          session in memory. This simulates a route guard for protected screens.
        </p>
      </div>

      <dl className="link-details">
        <div>
          <dt>Authenticated user in client session</dt>
          <dd>{JSON.stringify(authSession.user, null, 2)}</dd>
        </div>
        <div>
          <dt>Access token available</dt>
          <dd>{authSession.accessToken ? 'Yes, stored in memory' : 'No'}</dd>
        </div>
      </dl>

      <button className="secondary-button" type="button" onClick={handleLoadProtectedData} disabled={loading}>
        {loading ? 'Loading protected data...' : 'Load protected data'}
      </button>

      <StatusMessage tone="success" message={message} />
      <StatusMessage tone="error" message={error} />

      {serverUserSnapshot ? (
        <dl className="link-details">
          <div>
            <dt>Current user returned by backend</dt>
            <dd>{serverUserSnapshot}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}
