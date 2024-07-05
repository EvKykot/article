import { extendTheme, theme as baseTheme, ThemeOverride, StyleFunctionProps } from '@chakra-ui/react'
import { DEFAULT_THEME } from '@/constants/theme'

const darkThemeConfig = {
  colors: {
    ...baseTheme.colors,
    background: '#1A202C',
    text: '#E2E8F0',
  },
}

const lightThemeConfig = {
  colors: {
    ...baseTheme.colors,
    background: '#FFFFFF',
    text: '#4A5568',
  },
}

const components = {
  HeaderApp: {
    baseStyle: ({ colorMode }: StyleFunctionProps) => {
      return {
        bg: colorMode === 'dark' ? darkThemeConfig.colors.background : lightThemeConfig.colors.background,
        color: colorMode === 'dark' ? darkThemeConfig.colors.text : lightThemeConfig.colors.text,
      }
    },
  },
}

const customTheme: ThemeOverride = extendTheme({
  config: {
    initialColorMode: DEFAULT_THEME,
    useSystemColorMode: true,
  },
  components,
  styles: {
    global: ({ colorMode }: StyleFunctionProps) => ({
      body: {
        bg: colorMode === 'dark' ? darkThemeConfig.colors.background : lightThemeConfig.colors.background,
        color: colorMode === 'dark' ? darkThemeConfig.colors.text : lightThemeConfig.colors.text,
      },
    }),
  },
})

export default customTheme
