/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/downloads/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.android.package-archive',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="acorda-portugal-release.apk"',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/historia',
        destination: '/beta',
        permanent: true,
      },
      {
        source: '/historia/:path*',
        destination: '/beta',
        permanent: true,
      },
      {
        source: '/onde-tudo-comecou',
        destination: '/beta',
        permanent: true,
      },
      {
        source: '/mapa',
        destination: '/',
        permanent: false,
      },
      {
        source: '/portugal-mapa',
        destination: '/',
        permanent: false,
      },
      {
        source: '/mapa-portugal',
        destination: '/',
        permanent: false,
      },
      {
        source: '/map',
        destination: '/',
        permanent: false,
      },
      {
        source: '/mapa/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/portugal-mapa/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
