import { BooksListResponseType, BookType } from '@/types/books'
import { LanguageParams } from '@/types/language'
import getAxiosGlobalConfig from '@/api/axios'

const BASE_URL = 'http://gutendex.com'
const axiosInstance = getAxiosGlobalConfig(BASE_URL)

export const getBooksList = async ({ language }: LanguageParams): Promise<BooksListResponseType> =>
  axiosInstance.get('/books', { params: { language } })

type GetBookParams = { id: string } & LanguageParams

export const getBook = async ({ id, language }: GetBookParams): Promise<BookType> =>
  axiosInstance.get(`/books/${id}`, { params: { language } })
