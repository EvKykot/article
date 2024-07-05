import { GetServerSidePropsContext } from 'next'
import getLanguage from '@/utils/get-language'
import { Languages } from '@/constants/language'

type AsyncHandlerParamsType = GetServerSidePropsContext & { language: Languages }

type AsyncHandlerType<T> = (params: AsyncHandlerParamsType) => Promise<T>

type ErrorState = {
  rejected: true
  error: Error
  errorMessage: string
}

type NoErrorState = {
  rejected: false
  error: null
  errorMessage: null
}

type ServerSidePropsResultWithError<T> = {
  props: {
    data: T
  } & (ErrorState | NoErrorState)
}

const withServerSideProps =
  <T extends {}>(handler: AsyncHandlerType<T>) =>
  async (context: GetServerSidePropsContext): Promise<ServerSidePropsResultWithError<T>> => {
    try {
      const language = getLanguage(context)
      const response = await handler({ ...context, language })
      return { props: { data: response, rejected: false, error: null, errorMessage: null } }
    } catch (apiError) {
      const error = apiError instanceof Error ? apiError : new Error('An error occurred')
      return {
        props: {
          data: {} as T,
          rejected: true,
          error,
          errorMessage: error.message || 'An error occurred',
        },
      }
    }
  }

export default withServerSideProps
