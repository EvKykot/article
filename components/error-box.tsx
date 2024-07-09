import { Box, Text } from '@chakra-ui/react'

type ErrorBoxProps = {
  message: string
}

const ErrorBox = (props: ErrorBoxProps) => {
  const { message } = props

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
      <Text fontSize="xl" color="red.500">
        {message}
      </Text>
    </Box>
  )
}

export default ErrorBox
