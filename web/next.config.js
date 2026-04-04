/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL ?? 'http://localhost:4001'

const nextConfig = {
  transpilePackages: ['@control-aula/shared'],
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source:      '/socket.io',
        destination: `${API_URL}/socket.io`,
      },
      {
        source:      '/socket.io/:path*',
        destination: `${API_URL}/socket.io/:path*`,
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
