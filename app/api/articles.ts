import data from './mocked-articles.json'
import { ArticleType } from '@/app/types/articles'

const dataMap: Map<string, ArticleType> = new Map(data.map((article) => [article.id, article]))

export const getArticlesList = async (): Promise<ArticleType[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return data
}

export const getArticle = async (id: string): Promise<ArticleType> => {
  const article = dataMap.get(id)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!article) {
    throw new Error(`Article with id ${id} not found`)
  }

  return article
}
