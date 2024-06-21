import { useEffect, useState } from 'react'

export enum ResponseStatus {
  idle = 'idle',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}

const useFetch = (cb, params) => {
  const [data, setData] = useState<HarryPotterType[] | []>([])
  const [status, setStatus] = useState<ResponseStatus>(ResponseStatus.idle)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setStatus(ResponseStatus.pending)

    cb()
      .then((response) => {
        setData(response)
        setStatus(ResponseStatus.fulfilled)
      })
      .catch((apiError: unknown) => {
        setStatus(ResponseStatus.rejected)
        if (apiError instanceof Error) {
          setError(apiError)
        }
      })
  }, [])

  return {
    data,
    status,
    idle: status === ResponseStatus.idle,
    pending: status === ResponseStatus.pending,
    fulfilled: status === ResponseStatus.fulfilled,
    rejected: status === ResponseStatus.rejected,
  }
}
