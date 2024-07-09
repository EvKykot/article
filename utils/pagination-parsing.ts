const getParsedPaginationUrl = (urlString: string | number | null) => {
  if (!urlString) return null
  const url = new URL(String(urlString))
  const pageNumber = url.searchParams.get('page')
  if (!pageNumber) return null
  return parseInt(pageNumber, 10)
}

export default getParsedPaginationUrl
