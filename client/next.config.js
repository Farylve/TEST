/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This is experimental but can be enabled to allow parallel builds
    workerThreads: false,
    cpus: 1
  },
  // Disable telemetry
  telemetry: false,
  // Configure API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig