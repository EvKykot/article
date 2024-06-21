'use client'
import styles from './layout.module.scss'
import useAsync from '@/app/hooks/useAsync'
import { getArticlesList } from '@/app/api/articles'
import Loader from '@/app/components/loader/loader'
import TileListWrapper from '@/app/components/tile-list-wrapper/tile-list-wrapper'
import ArticleTile from '@/app/components/article-item/article-item'
import { useRouter } from 'next/navigation'
import { Routes } from '@/app/constants/routes'

const HomePage = () => {
  const router = useRouter()
  const { data, error, idle, pending } = useAsync(getArticlesList)

  const onOpenArticle = (id: string) => router.push(`${Routes.article}/${id}`)

  if (idle || pending) {
    return <Loader />
  }

  if (error) {
    return <main className={styles.main}>{error.message}</main>
  }

  return (
    <>
      <h2>Articles</h2>
      <TileListWrapper>
        {(data || []).map(({ id, title, description }) => (
          <ArticleTile key={id} title={title} description={description} onClick={() => onOpenArticle(id)} />
        ))}
      </TileListWrapper>
    </>
  )
}

export default HomePage
