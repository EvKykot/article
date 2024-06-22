'use client'
import { useRouter } from 'next/router'
import React, { FC, ReactNode, createContext, useState, useMemo, useEffect, useContext } from 'react'
import { Languages, DEFAULT_LANGUAGE } from '@/constants/language'
import { NOOP } from '@/constants/noop'
import Cookies from 'js-cookie'

type LanguageContextType = {
  language: Languages
  setLanguage: (nextLanguage: Languages) => void
}

const defaultLanguageContext = {
  language: DEFAULT_LANGUAGE,
  setLanguage: NOOP,
}

export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext)

type ProvidersType = {
  readonly children: ReactNode
}

export const LanguageProvider: FC<ProvidersType> = (props) => {
  const { children } = props
  const router = useRouter()

  const [language, setLanguage] = useState<Languages>(DEFAULT_LANGUAGE)

  const onSetLanguage = (nextLanguage: Languages) => {
    Cookies.set('language', nextLanguage)
    setLanguage(nextLanguage)
    router.reload()
  }

  const themeContextValue = useMemo(
    () => ({
      language,
      setLanguage: onSetLanguage,
    }),
    [language],
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookiesLanguage = (Cookies.get('language') as Languages) || DEFAULT_LANGUAGE
      setLanguage(cookiesLanguage)
    }
  }, [])

  return <LanguageContext.Provider value={themeContextValue}>{children}</LanguageContext.Provider>
}

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
