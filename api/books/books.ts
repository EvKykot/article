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
type GetBooksParams = LanguageParams & { page?: number; search?: string; topic?: string }
export const getBooksList = async (params: GetBooksParams): Promise<BooksListResponseType> => {
  const { language, page = 1, search, topic } = params
  return axiosInstance.get('/books', { params: { language, page, search, topic } })
}

/**
 *
 */
type GetBookParams = { id: string } & LanguageParams
export const getBook = async (params: GetBookParams): Promise<BookType> => {
  const { id, language } = params
  return axiosInstance.get(`/books/${id}`, { params: { language } })
}
