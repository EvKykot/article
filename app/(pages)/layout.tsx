import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.scss'
import ThemeProvider from '@/app/providers/theme-provider'

type RootLayoutPropsType = {
  children: ReactNode
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Test app with main page and article page',
}

const RootLayout = ({ children }: Readonly<RootLayoutPropsType>) => (
  <html lang="en">
    <body className={inter.className}>
      <ThemeProvider>{children}</ThemeProvider>
    </body>
  </html>
)

export default RootLayout
