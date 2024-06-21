'use client'
import React, { FC, ReactNode, createContext, useState, useMemo, useEffect, useContext } from 'react'
import { themesTokensConstants, DEFAULT_THEME, Themes } from '@/app/constants/theme'
import { changeThemesConstants } from '@/app/utils/theme-utils'

type ThemeContextType = {
  theme: Themes
  setTheme: (nextTheme: Themes) => void
}

const defaultThemeContext = {
  theme: DEFAULT_THEME,
  setTheme: () => {
    //
  },
}

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext)

type ProvidersType = {
  readonly children: ReactNode
}

export const ThemeProvider: FC<ProvidersType> = (props) => {
  const { children } = props

  const [theme, setTheme] = useState<Themes>(defaultThemeContext.theme)

  const themeTokens = useMemo(() => themesTokensConstants[theme], [theme])

  const themeContextValue = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  )

  useEffect(() => {
    changeThemesConstants(themeTokens)
  }, [themeTokens])

  return <ThemeContext.Provider value={themeContextValue}>{children}</ThemeContext.Provider>
}

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
