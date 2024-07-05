import { Button } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'

const ColorModeSwitcher = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return <Button onClick={toggleColorMode}>Switch to {colorMode === 'light' ? 'Dark' : 'Light'} Mode</Button>
}
