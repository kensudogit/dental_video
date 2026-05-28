import path from 'node:path'
import type { NextConfig } from 'next'
import { resolveApiUrl } from './src/lib/resolve-api-url'

const apiUrl = resolveApiUrl()

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  transpilePackages: ['@apollo/client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
  async rewrites() {
    return {
      afterFiles: [
        { source: '/auth/:path*', destination: `${apiUrl}/auth/:path*` },
      ],
    }
  },
}

export default nextConfig
