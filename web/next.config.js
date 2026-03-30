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
    ]
  },
}
module.exports = nextConfig
