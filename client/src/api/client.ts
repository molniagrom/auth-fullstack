import axios, { AxiosError } from 'axios'

import { getAccessToken } from './authSession'

type ApiErrorResponse = {
  message?: string
}

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return config
  }

  config.headers.set('Authorization', `Bearer ${accessToken}`)
  return config
})

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiErrorResponse | undefined)?.message

    if (message) {
      return message
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
