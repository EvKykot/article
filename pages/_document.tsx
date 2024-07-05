import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'
import { parseCookies } from 'nookies'
import { getThemeBodyClass, getValidTheme, Themes } from '@/constants/theme'
import { getValidLanguage, Languages } from '@/constants/language'

interface MyDocumentInitialProps extends DocumentInitialProps {
  language: Languages
  theme: Themes
}

class MyDocument extends Document<MyDocumentInitialProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    const cookies = parseCookies(ctx)
    const language = getValidLanguage(cookies.language)
    const theme = getValidTheme(cookies.theme)

    return { ...initialProps, language, theme }
  }

  render() {
    const { language, theme } = this.props
    const bodyClass = getThemeBodyClass(theme)

    return (
      <Html lang={language} data-theme={theme} style={{ colorScheme: theme }}>
        <Head />
        <body className={bodyClass}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
