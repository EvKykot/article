import { BooksListResponseType, BookType } from '@/types/books'
import { LanguageParams } from '@/types/language'
import getAxiosGlobalConfig from '@/api/axios'

/**
 *
 */
const BASE_URL = 'http://gutendex.com'
const axiosInstance = getAxiosGlobalConfig(BASE_URL)

/**
 *
 */
type GetBooksParams = LanguageParams & { page?: number }
export const getBooksList = async ({ language, page = 1 }: GetBooksParams): Promise<BooksListResponseType> =>
  axiosInstance.get('/books', { params: { language, page } })

/**
 *
 */
type GetBookParams = { id: string } & LanguageParams
export const getBook = async ({ id, language }: GetBookParams): Promise<BookType> =>
  axiosInstance.get(`/books/${id}`, { params: { language } })
