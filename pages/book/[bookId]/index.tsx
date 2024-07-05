import type { InferGetServerSidePropsType } from 'next'
import { getArticle } from '@/api/articles/articles'
import withServerSideProps from '@/api/with-server-side-props'
import getLanguage from '@/utils/get-language'
import styles from './page.module.scss'

type PageContextParams = {
  bookId: string
}

const getServerSideProps = withServerSideProps(async (context) => {
  const { bookId } = context.params as PageContextParams
  const language = getLanguage(context)
  const article = await getArticle({ id: bookId, language })
  return { title: article.title, description: article.description }
})

const ArticlePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, rejected, errorMessage } = props
  const { title, description } = data || {}

  if (rejected) {
    return <div className={styles.pageWrapper}>{errorMessage}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  )
}

export { getServerSideProps }
export default ArticlePage
