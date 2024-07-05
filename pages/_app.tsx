import type { Metadata } from 'next'
import type { AppProps } from 'next/app'
import React from 'react'
import Layout from '@/pages/layout'
import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { LanguageProvider } from '@/providers/language-provider'

import theme from '@/theme/theme'

export const metadata: Metadata = {
  title: 'Books',
  description: 'Here you can find and download some free books',
}

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <LanguageProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </LanguageProvider>
    </ChakraProvider>
  )
}

export default App
