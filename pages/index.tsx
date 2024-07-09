import { InferGetServerSidePropsType } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { getBooksList } from '@/api/books/books'
import withServerSideProps from '@/api/with-server-side-props'
import getParsedPaginationUrl from '@/utils/pagination-parsing'
import { Routes } from '@/constants/routes'
import { Box, Flex, VStack } from '@chakra-ui/react'
import BookCard from '@/components/book-card'
import Pagination from '@/components/pagination'
import ErrorBox from '@/components/error-box'

const getServerSideProps = withServerSideProps((context) =>
  getBooksList({ ...context, page: Number(context.query.page) || 1 }),
)

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, rejected, errorMessage } = props
  const router = useRouter()
  const queryParams = useSearchParams()
  const currentPage = queryParams.get('page')

  const { results, previous, next, count } = data

  useEffect(() => {
    if (!currentPage) router.replace('/?page=1')
  }, [router, currentPage])

  const onOpenBook = (id: string) => router.push(`${Routes.book}/${id}`)
  const onOpenPage = (pageNumber: number) => router.push(`${Routes.home}?page=${pageNumber}`)

  if (rejected) {
    return <ErrorBox message={errorMessage} />
  }

  return (
    <VStack spacing={4} align="stretch">
      <Flex wrap="wrap" justifyContent="center" gap="10" p={5}>
        {results.map((book) => (
          <BookCard key={book.id} book={book} onOpenBook={onOpenBook} />
        ))}
      </Flex>
      <Box p={5} display="flex" justifyContent="center">
        <Pagination
          totalCount={count}
          countPerPage={32}
          previousPageNumber={getParsedPaginationUrl(previous)}
          nextPageNumber={getParsedPaginationUrl(next)}
          onOpenPage={onOpenPage}
        />
      </Box>
    </VStack>
  )
}

export { getServerSideProps }
export default HomePage
