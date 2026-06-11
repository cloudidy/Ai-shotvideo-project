/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // 支持video目录作为静态资源 + 代理腾讯云COS视频
  async rewrites() {
    return [
      {
        source: '/video/:path*',
        destination: '/api/video/:path*',
      },
      {
        source: '/cos-video/:path*',
        destination: 'https://ai-video-demo-1442345125.cos.ap-guangzhou.myqcloud.com/:path*',
      },
    ]
  },
}

module.exports = nextConfig
