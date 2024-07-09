import { BookType, FormatsEnum } from '@/types/books'
import { Box, Button, Heading, Image, Text } from '@chakra-ui/react'

type BookCardProps = {
  book: BookType
  onOpenBook: (id: string) => void
}

const BookCard = (props: BookCardProps) => {
  const { book, onOpenBook } = props

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      width="300px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      textAlign="center"
    >
      <Box mb={4} display="flex" flexDirection="column" justifyContent="center">
        <Heading fontSize="xl" mb={4}>
          {book.title}
        </Heading>
        <Image objectFit="cover" alt={book.title} src={book.formats[FormatsEnum.jpeg] || '/book-placeholder.png'} />
      </Box>
      <Box flexDirection="column" justifyContent="center">
        <Text mt={4}>Authors: {book.authors.map((author) => author.name).join(', ')}</Text>
        <Button mt={4} onClick={() => onOpenBook(book.id)}>
          View Details
        </Button>
      </Box>
    </Box>
  )
}

export default BookCard
