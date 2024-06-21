import type { AxiosResponse } from 'axios'
import axios from 'axios'

import { JWT, getJwtLocalStorage, removeLocalStorage } from '@/app/utils/local-storage-utils'

export const getAxiosGlobalConfig = (baseURL: string) => {
  const redirectToLogin = () => {
    if (window?.location?.pathname !== 'login') {
      removeLocalStorage(JWT)
      window.location.href = 'login'
    }
  }

  const handleSuccess = (response: AxiosResponse) => response.data

  const handleError = (error: Record<string, any>) => {
    switch (error?.response?.status) {
      case 401: {
        return redirectToLogin()
      }
      case 404:
        console.error('Resource not found:', error.config.url)
        break
      default: {
        return { ...error?.response?.data, status: error?.response?.status }
      }
    }
  }

  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use((config) => {
    const token = getJwtLocalStorage()
    if (token && config.headers) {
      config.headers.Authorization = `${token}`
    }
    return config
  })

  instance.interceptors.response.use(handleSuccess, handleError)

  return instance
}
