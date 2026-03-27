import { useState } from 'react'
import type { FormEvent } from 'react'

import { StatusMessage } from './StatusMessage'

const apiBaseUrl = 'http://localhost:3001'

type ApiSuccess = {
  message: string
}

export function RegistrationForm() {
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [registrationPassword, setRegistrationPassword] = useState('')
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState('')
  const [registrationError, setRegistrationError] = useState('')

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

  return (
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
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
