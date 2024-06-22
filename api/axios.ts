import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { DEFAULT_LANGUAGE } from '@/constants/language'

const getAxiosGlobalConfig = (baseURL: string, language = DEFAULT_LANGUAGE) => {
  const handleSuccess = (response: AxiosResponse) => response.data

  const handleError = (error: Record<string, any>) => {
    switch (error?.response?.status) {
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
      'Accept-Language': language,
    },
  })

  instance.interceptors.response.use(handleSuccess, handleError)

  return instance
}

export default getAxiosGlobalConfig
