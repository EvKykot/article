import { BooksListResponseType } from '@/types/books'
import { LanguageParams } from '@/types/language'
import getAxiosGlobalConfig from '@/api/axios'

// type GetBooksParamsType = { id: string } & LanguageParams

const BASE_URL = 'http://gutendex.com'
const axiosInstance = getAxiosGlobalConfig(BASE_URL)

export const getBooksList = async ({ language }: LanguageParams): Promise<BooksListResponseType> =>
  axiosInstance.get('/books', { params: { language } })
