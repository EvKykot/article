'use client'
import { DependencyList, useEffect, useState } from 'react'

export enum ResponseStatus {
  idle = 'idle',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}

type AsyncHandlerType<T> = () => Promise<T>

const useRequest = <T>(handler: AsyncHandlerType<T>, deps: DependencyList = []) => {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<ResponseStatus>(ResponseStatus.idle)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setStatus(ResponseStatus.pending)

    handler()
      .then((response) => {
        setData(response)
        setStatus(ResponseStatus.fulfilled)
      })
      .catch((apiError: unknown) => {
        setStatus(ResponseStatus.rejected)
        setError(apiError instanceof Error ? apiError : new Error('An error occurred'))
      })
  }, deps)

  return {
    data,
    status,
    error,
    idle: status === ResponseStatus.idle,
    pending: status === ResponseStatus.pending,
    fulfilled: status === ResponseStatus.fulfilled,
    rejected: status === ResponseStatus.rejected,
  }
}

export default useRequest
