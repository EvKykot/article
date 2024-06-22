import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'
import { parseCookies } from 'nookies'

interface MyDocumentInitialProps extends DocumentInitialProps {
  language: string
}

class MyDocument extends Document<MyDocumentInitialProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    const cookies = parseCookies(ctx)
    const language = cookies.language || 'en'
    return { ...initialProps, language }
  }

  render() {
    const { language } = this.props
    const sharedStyles = `
      margin: 0;
      max-width: 100%;
      overflow-x: hidden;
    `

    return (
      <Html lang={language}>
        <Head>
          <style>{`
            html {
              ${sharedStyles}
            }
            body {
              ${sharedStyles}
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
