import { InferGetServerSidePropsType } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Box, Flex, HStack, VStack } from '@chakra-ui/react'

import { getBooksList } from '@/api/books/books'
import withServerSideProps from '@/api/with-server-side-props'

import { Routes } from '@/constants/routes'
import { getValidTopic, Topics, topicsOptions } from '@/constants/topics'
import getParsedPaginationUrl from '@/utils/pagination-parsing'

import BookCard from '@/components/book-card'
import Pagination from '@/components/pagination'
import ErrorBox from '@/components/error-box'
import SearchBox from '@/components/search-box'
import SelectDropdown from '@/components/select'

type QueryParams = {
  page?: string
  search?: string
  topic?: string
}

const getServerSideProps = withServerSideProps(async (context) => {
  const page = Number(context.query.page) || 1
  const search = String(context.query.search || '')
  const topic = String(context.query.topic || '')

  return getBooksList({ ...context, page, search, topic })
})

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, rejected, errorMessage } = props
  const { results, previous, next, count } = data

  const router = useRouter()
  const queryParams = useSearchParams()
  const searchEntries = Object.fromEntries(queryParams.entries())

  const { topic: queryTopic = '', search: querySearch = '', page: currentPage } = searchEntries
  const topic = getValidTopic(queryTopic)

  const [search, setSearch] = useState(querySearch)

  useEffect(() => {
    if (!currentPage) router.replace('/?page=1')
  }, [router, currentPage])

  const onOpenBook = (id: string) => router.push(`${Routes.book}/${id}`)

  const updateQueryParams = (nextParams: QueryParams) => {
    const currentParams = new URLSearchParams(queryParams.toString())

    Object.entries(nextParams).forEach(([key, value]) => {
      if (value !== undefined) {
        currentParams.set(key, value)
      } else {
        currentParams.delete(key)
      }
    })

    router.push(`${Routes.home}?${currentParams.toString()}`)
  }

  const onSearch = () => updateQueryParams({ search: encodeURIComponent(search), page: '1' })

  const onOpenNextPage = (nextPageNumber: number) => updateQueryParams({ page: String(nextPageNumber) })

  const onClearSearch = () => {
    setSearch('')
    updateQueryParams({ search: undefined, page: '1' })
  }

  const onSelectTopic = (value: string) => {
    const isAllTopics = value === Topics.allTopics
    const nextTopic = isAllTopics ? undefined : encodeURIComponent(value)
    updateQueryParams({ topic: nextTopic, page: '1' })
  }

  if (rejected) {
    return <ErrorBox message={errorMessage} />
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={4} p={10} pb={5}>
        <SearchBox
          value={search}
          placeholder="Search books..."
          onChange={setSearch}
          onSearch={onSearch}
          onClear={onClearSearch}
        />
        <Box>
          <SelectDropdown size="lg" value={topic} options={topicsOptions} onChange={onSelectTopic} />
        </Box>
      </HStack>
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
          onOpenPage={onOpenNextPage}
        />
      </Box>
    </VStack>
  )
}

export { getServerSideProps }
export default HomePage
