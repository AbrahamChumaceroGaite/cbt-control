/** @type {import('next').NextConfig} */
const API_URL       = process.env.API_URL       ?? 'http://localhost:4001'
const GAMES_API_URL = process.env.GAMES_API_URL ?? 'http://localhost:4003'

const nextConfig = {
  transpilePackages: ['@control-aula/shared'],
  async rewrites() {
    return [
      // api-games service (port 4003) — must come before the catch-all /api rule
      {
        source:      '/api-games/:path*',
        destination: `${GAMES_API_URL}/api/:path*`,
      },
      {
        source:      '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source:  '/sw.js',
        headers: [
          { key: 'Cache-Control',   value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}
module.exports = nextConfig
