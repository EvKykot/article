import type { AppProps } from 'next/app'
import Layout from '@/pages/layout'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { LanguageProvider } from '@/providers/language-provider'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Test app with main page and article page',
}

function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
