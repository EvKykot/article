import { ReactNode } from 'react'
import Dropdown from '@/components/dropdown/dropdown'
import { useThemeContext } from '@/providers/theme-provider'
import { themesOptions } from '@/constants/theme'
import styles from './layout.module.scss'
import { useLanguageContext } from '@/providers/language-provider'
import { languagesOptions } from '@/constants/language'

type LayoutPropsType = {
  children: ReactNode
}

const Layout = ({ children }: Readonly<LayoutPropsType>) => {
  const { theme, setTheme } = useThemeContext()
  const { language, setLanguage } = useLanguageContext()

  return (
    <main className={styles.pageLayout}>
      <div className={styles.layoutHeader}>
        <Dropdown active={language} options={languagesOptions} onClick={({ value }) => setLanguage(value)} />
        <Dropdown active={theme} options={themesOptions} onClick={({ value }) => setTheme(value)} />
      </div>
      {children}
    </main>
  )
}

export default Layout
