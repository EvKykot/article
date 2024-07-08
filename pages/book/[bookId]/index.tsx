import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  Box,
  Text,
  Link,
  Heading,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import type { InferGetServerSidePropsType } from 'next'
import withServerSideProps from '@/api/with-server-side-props'
import getLanguage from '@/utils/get-language'
import { getBook } from '@/api/books/books'
import MenuDropdown from '@/components/menu-dropdown'
import { isDefinedOption } from '@/utils/is-defined-option'

type PageContextParams = {
  bookId: string
}

const getServerSideProps = withServerSideProps(async (context) => {
  const { bookId } = context.params as PageContextParams
  const language = getLanguage(context)
  return await getBook({ id: bookId, language })
})

const BookPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: book, rejected, errorMessage } = props

  const formatsOptions = Object.entries(book.formats)
    .map(([format, url]) => ({ label: format, value: url }))
    .filter(isDefinedOption)

  if (rejected) {
    return (
      <Box p={5}>
        <Text>{errorMessage}</Text>
      </Box>
    )
  }

  return (
    <Card align="stretch" p={5}>
      <CardHeader>
        <Heading size="lg">{book.title}</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Authors:
            </Heading>
            {book.authors.map((author) => (
              <Tag size="md" key={author.name} variant="solid" colorScheme="teal" mr={2} mb={2}>
                <TagLabel>{author.name}</TagLabel>
              </Tag>
            ))}
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Download Count:
            </Heading>
            <Tag size="md" variant="solid" colorScheme="orange" mr={2} mb={2}>
              <TagLabel>{book.download_count}</TagLabel>
            </Tag>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Languages:
            </Heading>
            {book.languages.map((language) => (
              <Tag size="md" key={language} variant="solid" colorScheme="blue" mr={2} mb={2}>
                {language}
              </Tag>
            ))}
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Media Type:
            </Heading>
            <Tag size="md" variant="solid" colorScheme="orange" mr={2} mb={2}>
              <TagLabel>{book.media_type}</TagLabel>
            </Tag>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Subjects:
            </Heading>
            {book.subjects.map((subject) => (
              <Tag size="md" key={subject} variant="solid" colorScheme="purple" mr={2} mb={2}>
                <TagLabel>{subject}</TagLabel>
              </Tag>
            ))}
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              Available Formats:
            </Heading>
            <MenuDropdown asHref isExternal label="Download" as={Link} options={formatsOptions} />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

export { getServerSideProps }
export default BookPage
