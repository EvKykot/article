import data from './mocked-articles.json'
import { ArticleType } from '@/types/articles'
import { Languages } from '@/constants/language'
// import getAxiosGlobalConfig from '@/api/axios'

const dataMap: Map<string, ArticleType> = new Map(data.map((article) => [article.id, article]))
// const BASE_URL = 'http://184.73.145.4:8085'

// const axiosInstance = getAxiosGlobalConfig(BASE_URL)
// export const getArticlesList = async (): Promise<ArticleType[]> => {
//   console.log('getArticlesList is called')
//   return axiosInstance.get(`product/all`)
// }

export const getArticlesList = async (_: undefined, language: Languages): Promise<ArticleType[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (language === Languages.english) {
    return data
  }

  if (language === Languages.french) {
    return data.map((article) => ({
      ...article,
      title: `${article.title} - French`,
      description: `${article.description} - French`,
    }))
  }

  return data
}

export const getArticle = async (id: string, language: Languages): Promise<ArticleType> => {
  const article = dataMap.get(id)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!article) {
    throw new Error(`Article with id ${id} not found`)
  }

  if (language === Languages.english) {
    return article
  }

  if (language === Languages.french) {
    return {
      ...article,
      title: `${article.title} - French`,
      description: `${article.description} - French`,
    }
  }

  return article
}
