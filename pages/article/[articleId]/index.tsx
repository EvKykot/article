import type { InferGetServerSidePropsType } from 'next'

import { getArticle } from '@/api/articles'
import Loader from '@/components/loader/loader'
import withServerSideProps from '@/api/with-server-side-props'
import styles from './page.module.scss'

type PageContextParams = {
  articleId: string
}

const getServerSideProps = withServerSideProps(async (context) => {
  const { articleId } = context.params as PageContextParams
  const article = await getArticle(articleId)
  return { title: article.title, description: article.description }
})

const ArticlePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, fulfilled, rejected, errorMessage } = props

  const { title, description } = data || {}

  if (!fulfilled && !rejected) {
    return <Loader />
  }

  if (rejected && errorMessage) {
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
