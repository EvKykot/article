import type { AxiosResponse } from 'axios'
import axios from 'axios'

const getAxiosGlobalConfig = (baseURL: string) => {
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
    },
  })

  instance.interceptors.response.use(handleSuccess, handleError)

  return instance
}

export default getAxiosGlobalConfig
