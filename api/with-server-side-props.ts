import { GetServerSidePropsContext } from 'next'
import getLanguage from '@/utils/get-language'
import { Languages } from '@/constants/language'

type AsyncHandlerType<T> = (context: GetServerSidePropsContext, language: Languages) => Promise<T>

type ServerSidePropsResultWithError<T> = {
  props: {
    data: T
    fulfilled: boolean
    rejected: boolean
    error?: Error
    errorMessage?: string
  }
}

const withServerSideProps =
  <T extends {}>(handler: AsyncHandlerType<T>) =>
  async (context: GetServerSidePropsContext): Promise<ServerSidePropsResultWithError<T>> => {
    try {
      const language = getLanguage(context)
      const response = await handler(context, language)
      return { props: { data: response, fulfilled: true, rejected: false } }
    } catch (apiError) {
      const error = apiError instanceof Error ? apiError : new Error('An error occurred')
      return {
        props: {
          data: {} as T,
          fulfilled: false,
          rejected: true,
          error,
          errorMessage: error.message,
        },
      }
    }
  }

export default withServerSideProps
