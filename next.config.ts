import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'drive.google.com',
      'lh3.googleusercontent.com'
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true
  },
  // Suppress hydration warnings for image components
  reactStrictMode: false,
  // Custom webpack config to suppress specific warnings
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  }
};

export default nextConfig;
