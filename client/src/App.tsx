import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const apiBaseUrl = 'http://localhost:3001'

type ApiSuccess = {
  message: string
}

type ViewMode = 'register' | 'verify'

function App() {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  )
  const viewMode: ViewMode =
    window.location.pathname === '/verify-email' ? 'verify' : 'register'

  const [registrationEmail, setRegistrationEmail] = useState('')
  const [registrationPassword, setRegistrationPassword] = useState('')
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState('')
  const [registrationError, setRegistrationError] = useState('')

  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  const emailFromLink = searchParams.get('email') ?? ''
  const codeFromLink = searchParams.get('code') ?? ''

  useEffect(() => {
    if (viewMode !== 'verify') {
      return
    }

    if (!emailFromLink || !codeFromLink) {
      setVerifyError('Verification link is incomplete. Check the backend console log and open the full link again.')
      return
    }

    let isCancelled = false

    startVerifyEmail({
      email: emailFromLink,
      code: codeFromLink,
      onStart: () => {
        if (!isCancelled) {
          setVerifyLoading(true)
          setVerifyError('')
          setVerifyMessage('')
        }
      },
      onSuccess: (message) => {
        if (!isCancelled) {
          setVerifyMessage(message)
        }
      },
      onError: (message) => {
        if (!isCancelled) {
          setVerifyError(message)
        }
      },
      onFinally: () => {
        if (!isCancelled) {
          setVerifyLoading(false)
        }
      },
    })

    return () => {
      isCancelled = true
    }
  }, [viewMode, emailFromLink, codeFromLink])

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRegistrationLoading(true)
    setRegistrationError('')
    setRegistrationSuccess('')

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationEmail,
          password: registrationPassword,
        }),
      })

      const data = (await response.json()) as ApiSuccess

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setRegistrationSuccess(data.message)
      setRegistrationPassword('')
    } catch (error) {
      setRegistrationError(getErrorMessage(error, 'Registration failed.'))
    } finally {
      setRegistrationLoading(false)
    }
  }

  async function handleResendCode() {
    setResendLoading(true)
    setResendMessage('')
    setResendError('')

    try {
      const response = await fetch(`${apiBaseUrl}/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailFromLink,
        }),
      })

      const data = (await response.json()) as ApiSuccess

      if (!response.ok) {
        throw new Error(data.message || 'Resend code failed.')
      }

      setResendMessage(data.message)
    } catch (error) {
      setResendError(getErrorMessage(error, 'Resend code failed.'))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Auth Fullstack</p>
        <h1>Email verification learning flow</h1>
        <p className="lead">
          This project does not send real emails. The backend logs a verification
          link to the console through an SMTP mock adapter.
        </p>
      </section>

      {viewMode === 'register' ? (
        <section className="panel form-panel">
          <div className="panel-copy">
            <p className="section-label">RegistrationForm</p>
            <h2>Create account</h2>
            <p>
              Submit your email and password. After success, open the backend
              console, copy the logged verification link, and open it in the
              browser.
            </p>
          </div>

          <form className="form-grid" onSubmit={handleRegisterSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={registrationEmail}
                onChange={(event) => setRegistrationEmail(event.target.value)}
                placeholder="student@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={registrationPassword}
                onChange={(event) => setRegistrationPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={registrationLoading}>
              {registrationLoading ? 'Registering...' : 'Create account'}
            </button>
          </form>

          <StatusMessage tone="success" message={registrationSuccess} />
          <StatusMessage tone="error" message={registrationError} />
        </section>
      ) : (
        <section className="panel form-panel">
          <div className="panel-copy">
            <p className="section-label">VerifyEmailForm</p>
            <h2>Verify email</h2>
            <p>
              This page reads <code>email</code> and <code>code</code> from the
              verification link and sends <code>POST /auth/verify-email</code> on
              mount.
            </p>
          </div>

          <dl className="link-details">
            <div>
              <dt>Email from link</dt>
              <dd>{emailFromLink || 'Missing'}</dd>
            </div>
            <div>
              <dt>Code from link</dt>
              <dd>{codeFromLink || 'Missing'}</dd>
            </div>
          </dl>

          {verifyLoading ? <p className="status neutral">Verifying email...</p> : null}
          <StatusMessage tone="success" message={verifyMessage} />
          <StatusMessage tone="error" message={verifyError} />

          <div className="resend-box">
            <div>
              <p className="section-label">Resend code</p>
              <p>
                If the link became stale, request a new one and check the backend
                console log again.
              </p>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || !emailFromLink}
            >
              {resendLoading ? 'Sending...' : 'Resend code'}
            </button>
          </div>

          <StatusMessage tone="success" message={resendMessage} />
          <StatusMessage tone="error" message={resendError} />
        </section>
      )}
    </main>
  )
}

function StatusMessage(props: { tone: 'success' | 'error'; message: string }) {
  if (!props.message) {
    return null
  }

  return <p className={`status ${props.tone}`}>{props.message}</p>
}

async function startVerifyEmail(params: {
  email: string
  code: string
  onStart: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onFinally: () => void
}) {
  params.onStart()

  try {
    const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        code: params.code,
      }),
    })

    const data = (await response.json()) as ApiSuccess

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed.')
    }

    params.onSuccess(data.message)
  } catch (error) {
    params.onError(getErrorMessage(error, 'Verification failed.'))
  } finally {
    params.onFinally()
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default App
