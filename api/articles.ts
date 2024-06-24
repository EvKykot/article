import data from './mocked-articles.json'
import { ArticleType } from '@/types/articles'
import { Languages } from '@/constants/language'

const dataMap: Map<string, ArticleType> = new Map(data.map((article) => [article.id, article]))

type LanguageParams = { language: Languages }

type GetArticleParams = { id: string } & LanguageParams

export const getArticlesList = async ({ language }: LanguageParams): Promise<ArticleType[]> => {
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

export const getArticle = async ({ id, language }: GetArticleParams): Promise<ArticleType> => {
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
