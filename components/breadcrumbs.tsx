import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'

const Breadcrumbs = () => {
  const router = useRouter()

  const isHome = router.asPath === '/'

  const breadcrumbs = useMemo(() => {
    const pathnames = router.asPath.split('/').filter((x) => x)
    let breadcrumbItems = [{ name: 'Home', href: '/' }]

    if (pathnames[0] === 'book' && pathnames.length === 2) {
      const bookId = pathnames[1]
      breadcrumbItems.push({ name: `book : ${bookId}`, href: '' })
    }

    return breadcrumbItems
  }, [router.asPath])

  return (
    <Breadcrumb>
      {breadcrumbs.map((breadcrumb, index) => (
        <BreadcrumbItem key={index} isCurrentPage={index === breadcrumbs.length - 1}>
          <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.name}</BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}

export default Breadcrumbs
