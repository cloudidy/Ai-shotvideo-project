/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // 支持video目录作为静态资源
  async rewrites() {
    return [
      {
        source: '/video/:path*',
        destination: '/api/video/:path*',
      },
    ]
  },
}

module.exports = nextConfig
