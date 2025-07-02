/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['html-to-image'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 