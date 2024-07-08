import { Box, Button, Text, VStack, Heading, SimpleGrid, GridItem } from '@chakra-ui/react'
import { InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/navigation'
import { Routes } from '@/constants/routes'
import withServerSideProps from '@/api/with-server-side-props'
import { getBooksList } from '@/api/books/books'

const getServerSideProps = withServerSideProps(getBooksList)

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, rejected, errorMessage } = props
  const router = useRouter()

  const onOpenBook = (id: string) => router.push(`${Routes.book}/${id}`)

  if (rejected) {
    return (
      <Box p={5}>
        <Text>{errorMessage}</Text>
      </Box>
    )
  }

  const handlePagination = (url: string | null) => url && router.push(url)

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={3} spacing={10} p={5}>
        {data?.results.map((book) => (
          <GridItem key={book.id} p={5} shadow="md" borderWidth="1px">
            <Heading fontSize="xl">{book.title}</Heading>
            <Text mt={4}>Authors: {book.authors.map((author) => author.name).join(', ')}</Text>
            <Button mt={4} onClick={() => onOpenBook(book.id)}>
              View Details
            </Button>
          </GridItem>
        ))}
      </SimpleGrid>
      <Box p={5} display="flex" justifyContent="space-between">
        <Button onClick={() => handlePagination(data?.previous)} isDisabled={!data?.previous}>
          Previous
        </Button>
        <Button onClick={() => handlePagination(data?.next)} isDisabled={!data?.next}>
          Next
        </Button>
      </Box>
    </VStack>
  )
}

export { getServerSideProps }
export default HomePage
