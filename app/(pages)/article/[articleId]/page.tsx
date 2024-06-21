'use client'
import useAsync from '@/app/hooks/useAsync'
import { getArticle } from '@/app/api/articles'
import Loader from '@/app/components/loader/loader'
import { useParams } from 'next/navigation'
import styles from './page.module.scss'

const ArticlePage = () => {
  const { articleId } = useParams<{ articleId: string }>()

  const { data, error, idle, pending } = useAsync(() => getArticle(articleId), [articleId])
  const { title = '', description = '' } = data || {}

  if (idle || pending) {
    return <Loader />
  }

  if (error) {
    return <>{error.message}</>
  }

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  )
}

export default ArticlePage
