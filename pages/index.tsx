import type { InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/navigation'
import { Routes } from '@/constants/routes'
import withServerSideProps from '@/api/with-server-side-props'
import { getBooksList } from '@/api/books/books'

export const getServerSideProps = withServerSideProps(getBooksList)

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, rejected, errorMessage } = props
  const router = useRouter()

  const onOpenArticle = (id: string) => router.push(`${Routes.article}/${id}`)

  if (rejected) {
    return <main>{errorMessage}</main>
  }

  return (
    <>
      <h2>Books</h2>
      {/*<TileListWrapper>*/}
      {/*  {(data || []).map(({ id, title, description }) => (*/}
      {/*    <BookItem key={id} title={title} description={description} onClick={() => onOpenArticle(id)} />*/}
      {/*  ))}*/}
      {/*</TileListWrapper>*/}
    </>
  )
}

export default HomePage
