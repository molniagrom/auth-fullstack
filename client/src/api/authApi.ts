import { apiClient } from './client'

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

export async function registerUser(body: RegisterRequest) {
  const response = await apiClient.post<ApiSuccess>('/auth/register', body)
  return response.data
}

export async function verifyEmail(body: VerifyEmailRequest) {
  const response = await apiClient.post<ApiSuccess>('/auth/verify-email', body)
  return response.data
}

export async function resendVerificationCode(body: ResendCodeRequest) {
  const response = await apiClient
      .post<ApiSuccess>('/auth/resend-code', body)
  return response.data
}
