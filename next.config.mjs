
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/toolsoivo',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
