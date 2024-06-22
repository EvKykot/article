export enum Languages {
  english = 'en',
  french = 'fr',
}

export type Language = {
  key: Languages
  title: string
}

export const DEFAULT_LANGUAGE = Languages.english

export const languages: Language[] = [
  { key: Languages.english, title: 'English' },
  { key: Languages.french, title: 'French' },
]

export const languagesOptions = languages.map(({ key, title }) => ({ key, value: key, label: title }))
