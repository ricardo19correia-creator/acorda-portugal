import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin', '/master-control', '/master', '/api/admin/'],
      },
    ],
    sitemap: 'https://acordaportugal.pt/sitemap.xml',
  }
}
