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

const customTheme: ThemeOverride = extendTheme({
  config: {
    initialColorMode: DEFAULT_THEME,
    useSystemColorMode: false,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === 'dark' ? darkThemeConfig.colors.background : lightThemeConfig.colors.background,
        color: props.colorMode === 'dark' ? darkThemeConfig.colors.text : lightThemeConfig.colors.text,
      },
    }),
  },
})

export default customTheme
