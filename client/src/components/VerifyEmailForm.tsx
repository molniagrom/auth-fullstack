import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '../api/client'
import { resendVerificationCode, verifyEmail } from '../api/authApi'
import { StatusMessage } from './StatusMessage'

export function VerifyEmailForm() {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  )
  const emailFromLink = searchParams.get('email') ?? ''
  const codeFromLink = searchParams.get('code') ?? ''

  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    if (!emailFromLink || !codeFromLink) {
      setVerifyError('Verification link is incomplete. Check the backend console log and open the full link again.')
      return
    }

    let isCancelled = false

    void startVerifyEmail({
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
  }, [emailFromLink, codeFromLink])

  async function handleResendCode() {
    setResendLoading(true)
    setResendMessage('')
    setResendError('')

    try {
      const data = await resendVerificationCode({
        email: emailFromLink,
      })

      setResendMessage(data.message)
    } catch (error) {
      setResendError(getErrorMessage(error, 'Resend code failed.'))
    } finally {
      setResendLoading(false)
    }
  }

  return (
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
  )
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
    const data = await verifyEmail({
      email: params.email,
      code: params.code,
    })

    params.onSuccess(data.message)
  } catch (error) {
    params.onError(getErrorMessage(error, 'Verification failed.'))
  } finally {
    params.onFinally()
  }
}
