export enum Themes {
  light = 'light',
  dark = 'dark',
}

export type Theme = {
  key: Themes
  title: string
  constants: Record<string, string>
}

export const DEFAULT_THEME = Themes.dark

export const themesTokensConstants = {
  [Themes.light]: {
    // layout
    '--layout-bg': '#fff',
    '--layout-color': '#000',
    // loader
    '--loader-bg': '#fff',
    '--loader-border': '#000',
    // article-item
    '--article-bg': '#fff',
    '--article-title': '#000000',
    '--article-description': '#666666',
    '--article-border': '#000',
    // dropdown
    '--dropdown-color': '#000',
    '--dropdown-bg': '#fff',
    '--dropdown-border': '#000',
    '--dropdown-active-item': '#219',
  },
  [Themes.dark]: {
    // layout
    '--layout-bg': '#000',
    '--layout-color': '#fff',
    // loader
    '--loader-bg': '#000',
    '--loader-border': '#fff',
    // article-item
    '--article-bg': '#000',
    '--article-title': '#fff',
    '--article-description': '#666666',
    '--article-border': '#fff',
    // dropdown
    '--dropdown-color': '#fff',
    '--dropdown-bg': '#000',
    '--dropdown-border': '#fff',
    '--dropdown-active-item': '#219',
  },
}

export const themes: Theme[] = [
  { key: Themes.light, title: 'Light', constants: themesTokensConstants[Themes.light] },
  { key: Themes.dark, title: 'Dark', constants: themesTokensConstants[Themes.dark] },
]

export const themesOptions = themes.map(({ key, title }) => ({ key, value: key, label: title }))
