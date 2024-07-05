enum DownloadFormatsEnum {
  epubZip = 'application/epub+zip',
  octetStream = 'application/octet-stream',
  rdfXml = 'application/rdf+xml',
  xMobipocketEbook = 'application/x-mobipocket-ebook',
  jpeg = 'image/jpeg',
  html = 'text/html',
  plain = 'text/plain; charset=us-ascii',
}

type FormatsType = Record<DownloadFormatsEnum, string | undefined>

export type AuthorType = {
  birth_year: number
  death_year: number | null
  name: string
}

export type BookType = {
  id: string
  authors: AuthorType[]
  copyright: boolean
  download_count: number
  formats: FormatsType
  languages: string[]
  media_type: string
  subjects: string[]
  title: string
  translators: AuthorType[]
}

export type BooksListResponseType = {
  count: number
  next: string | null
  previous: string | null
  results: BookType[]
}
