export enum Themes {
  light = 'light',
  dark = 'dark',
}

export type Theme = {
  key: Themes
  title: string
}

export const DEFAULT_THEME = Themes.dark

export const themes: Theme[] = [
  { key: Themes.light, title: 'Light' },
  { key: Themes.dark, title: 'Dark' },
]

export const themesOptions = themes.map(({ key, title }) => ({ key, value: key, label: title }))

export const getValidTheme = (theme: string): Themes =>
  Object.values(Themes).includes(theme as Themes) ? (theme as Themes) : Themes.light

export const getThemeBodyClass = (theme: Themes) => `chakra-ui-${theme}`
