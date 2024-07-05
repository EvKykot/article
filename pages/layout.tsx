import { ReactNode } from 'react'
import { Box, Flex, Heading, useColorMode } from '@chakra-ui/react'
import Cookies from 'js-cookie'

import Dropdown from '@/components/dropdown'
import { useLanguageContext } from '@/providers/language-provider'
import { languagesOptions } from '@/constants/language'
import { themesOptions } from '@/constants/theme'

type LayoutPropsType = {
  children: ReactNode
}

const Layout = ({ children }: Readonly<LayoutPropsType>) => {
  const { colorMode, setColorMode } = useColorMode()
  const { language, setLanguage } = useLanguageContext()

  const onChangeTheme = (theme: string) => {
    setColorMode(theme)
    if (typeof window !== 'undefined') {
      Cookies.set('theme', theme, { expires: 365 })
    }
  }

  return (
    <Box>
      <Flex as="header" justifyContent="space-between" alignItems="center" p="4" bg="blue.500" color="white">
        <Heading size="md">Books</Heading>
        <Flex gap="4">
          <Dropdown value={language} options={languagesOptions} onChange={setLanguage} />
          <Dropdown value={colorMode} options={themesOptions} onChange={onChangeTheme} />
        </Flex>
      </Flex>
      <Box as="main">{children}</Box>
    </Box>
  )
}

export default Layout
