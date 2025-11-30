// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
