import { postJson } from './client'

type ApiSuccess = {
  message: string
}

type RegisterRequest = {
  email: string
  password: string
}

type VerifyEmailRequest = {
  email: string
  code: string
}

type ResendCodeRequest = {
  email: string
}

export function registerUser(body: RegisterRequest) {
  return postJson<ApiSuccess, RegisterRequest>('/auth/register', body)
}

export function verifyEmail(body: VerifyEmailRequest) {
  return postJson<ApiSuccess, VerifyEmailRequest>('/auth/verify-email', body)
}

export function resendVerificationCode(body: ResendCodeRequest) {
  return postJson<ApiSuccess, ResendCodeRequest>('/auth/resend-code', body)
}
