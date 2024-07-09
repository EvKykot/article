import React from 'react'
import { IconButton, Button, HStack, Text } from '@chakra-ui/react'
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'

interface PaginationProps {
  previousPageNumber: number | null
  nextPageNumber: number | null
  totalCount: number
  countPerPage: number
  onOpenPage: (pageNumber: number) => void
}

const VISIBLE_PAGES_COUNT = 5

const Pagination: React.FC<PaginationProps> = ({
  previousPageNumber,
  nextPageNumber,
  totalCount,
  countPerPage = 32,
  onOpenPage,
}) => {
  const totalPages = Math.ceil(totalCount / countPerPage)
  const currentPage = previousPageNumber ? previousPageNumber + 1 : nextPageNumber ? nextPageNumber - 1 : 1

  let startPage = Math.max(1, currentPage - Math.floor(VISIBLE_PAGES_COUNT / 2))
  let endPage = Math.min(totalPages, startPage + VISIBLE_PAGES_COUNT - 1)

  if (endPage - startPage + 1 < VISIBLE_PAGES_COUNT) {
    startPage = Math.max(1, endPage - VISIBLE_PAGES_COUNT + 1)
  }

  const onPageClick = (pageNumber: number) => {
    onOpenPage(pageNumber)
  }

  return (
    <HStack spacing={3}>
      <IconButton
        aria-label="prev-page"
        icon={<ArrowLeftIcon />}
        isDisabled={!previousPageNumber}
        onClick={() => previousPageNumber && onPageClick(previousPageNumber)}
      />
      {startPage > 1 && <Text>.....</Text>}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNumber) => (
        <Button
          key={pageNumber}
          onClick={() => onPageClick(pageNumber)}
          variant={currentPage === pageNumber ? 'solid' : 'ghost'}
        >
          {pageNumber}
        </Button>
      ))}
      {endPage < totalPages && <Text>.....</Text>}
      <IconButton
        aria-label="next-page"
        icon={<ArrowRightIcon />}
        isDisabled={!nextPageNumber}
        onClick={() => nextPageNumber && onPageClick(nextPageNumber)}
      />
    </HStack>
  )
}

export default Pagination
