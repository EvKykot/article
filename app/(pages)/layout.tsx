'use client'
import { ReactNode } from 'react'
import styles from './layout.module.scss'
import Dropdown from '@/app/components/dropdown/dropdown'
import { useThemeContext } from '@/app/providers/theme-provider'
import { themesOptions } from '@/app/constants/theme'

type PageLayoutPropsType = {
  children: ReactNode
}

const PageLayout = ({ children }: Readonly<PageLayoutPropsType>) => {
  const { theme, setTheme } = useThemeContext()

  return (
    <main className={styles.pageLayout}>
      <div className={styles.layoutHeader}>
        <Dropdown active={theme} options={themesOptions} onClick={({ value }) => setTheme(value)} />
      </div>
      {children}
    </main>
  )
}

export default PageLayout
