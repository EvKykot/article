import { ReactNode } from 'react'
import { Box, Grid, GridItem, Heading, Flex, useColorMode, useColorModeValue } from '@chakra-ui/react'
import Cookies from 'js-cookie'

import Select from '@/components/select'
import Breadcrumbs from '@/components/breadcrumbs'
import { useLanguageContext } from '@/providers/language-provider'
import { languagesOptions } from '@/constants/language'
import { themesOptions } from '@/constants/theme'

type LayoutPropsType = {
  children: ReactNode
}

const Layout = ({ children }: Readonly<LayoutPropsType>) => {
  const { colorMode, setColorMode } = useColorMode()
  const { language, setLanguage } = useLanguageContext()

  const headerBgColor = useColorModeValue('blue.200', 'blue.700')
  const headerTextColor = useColorModeValue('black', 'white')

  const onChangeTheme = (theme: string) => {
    setColorMode(theme)
    if (typeof window !== 'undefined') {
      Cookies.set('theme', theme, { expires: 365 })
    }
  }

  return (
    <Box>
      <Grid
        as="header"
        templateColumns="repeat(3, 1fr)"
        p="4"
        alignItems="center"
        bg={headerBgColor}
        color={headerTextColor}
      >
        <GridItem colStart={1} colEnd={2}>
          <Breadcrumbs />
        </GridItem>
        <GridItem colStart={2} colEnd={3}>
          <Heading size="lg" textAlign="center">
            e-Books
          </Heading>
        </GridItem>
        <GridItem colStart={3} colEnd={4} justifySelf="end">
          <Flex gap="4">
            <Select value={language} options={languagesOptions} onChange={setLanguage} />
            <Select value={colorMode} options={themesOptions} onChange={onChangeTheme} />
          </Flex>
        </GridItem>
      </Grid>
      <Box as="main">{children}</Box>
    </Box>
  )
}

export default Layout
