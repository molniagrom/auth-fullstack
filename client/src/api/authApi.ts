import { AxiosError } from 'axios'

import { axiosInstance } from './client'
import { clearAccessToken, getAccessToken, setAccessToken } from './authSession'

type ApiSuccess = {
  message: string
}

type AuthUser = {
  id: string
  email: string
}

type LoginSuccess = ApiSuccess & {
  accessToken: string
  user: AuthUser
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

type LoginRequest = {
  email: string
  password: string
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

  async login(body: LoginRequest) {
    const response = await axiosInstance.post<LoginSuccess>('/auth/login', body)
    setAccessToken(response.data.accessToken)
    return response.data
  },

  async refresh() {
    const response = await axiosInstance.post<LoginSuccess>('/auth/refresh')
    setAccessToken(response.data.accessToken)
    return response.data
  },

  async getCurrentUser() {
    const response = await axiosInstance.get<AuthUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })

    return response.data
  },

  async getCurrentUserWithRefreshRetry() {
    try {
      return await this.getCurrentUser()
    } catch (error) {
      if (!(error instanceof AxiosError) || error.response?.status !== 401) {
        throw error
      }

      await this.refresh()
      return this.getCurrentUser()
    }
  },

  async logout() {
    const response = await axiosInstance.post<ApiSuccess>('/auth/logout')
    clearAccessToken()
    return response.data
  },
}
