import type { InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/navigation'
import { getArticlesList } from '@/api/articles'
import Loader from '@/components/loader/loader'
import TileListWrapper from '@/components/tile-list-wrapper/tile-list-wrapper'
import ArticleTile from '@/components/article-item/article-item'
import { Routes } from '@/constants/routes'
import withServerSideProps from '@/api/with-server-side-props'
import styles from './layout.module.scss'

export const getServerSideProps = withServerSideProps(getArticlesList)

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, fulfilled, rejected, errorMessage } = props
  const router = useRouter()

  const onOpenArticle = (id: string) => router.push(`${Routes.article}/${id}`)

  if (!fulfilled && !rejected) {
    return <Loader />
  }

  if (rejected && errorMessage) {
    return <main className={styles.main}>{errorMessage}</main>
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
