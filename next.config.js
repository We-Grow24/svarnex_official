/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Disable webpack cache to avoid route group issues
  webpack: (config) => {
    config.cache = false;
    return config;
  },
}

module.exports = nextConfig
