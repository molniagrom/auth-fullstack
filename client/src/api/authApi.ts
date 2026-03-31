import { axiosInstance } from './client'

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

export const api = {
  async registerUser(body: RegisterRequest) {
    const response = await axiosInstance.post<ApiSuccess>('/auth/register', body)
    return response.data
  },

  async verifyEmail(body: VerifyEmailRequest) {
    const response = await axiosInstance.post<ApiSuccess>('/auth/verify-email', body)
    return response.data
  },

  async resendVerificationCode(body: ResendCodeRequest) {
    const response = await axiosInstance.post<ApiSuccess>('/auth/resend-code', body)
    return response.data
  },
}
