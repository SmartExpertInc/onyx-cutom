// custom_extensions/frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/custom-projects-ui',
  assetPrefix: '/custom-projects-ui',
  
  // Configure rewrites to handle static design images
  async rewrites() {
    return [
      {
        source: '/static_design_images/:path*',
        destination: '/api/custom-projects-backend/static_design_images/:path*',
      },
    ];
  },
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/static_design_images/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/static_design_images/**',
      },
    ],
    unoptimized: true, // Since we're already setting unoptimized on individual images
  },
};

export default nextConfig;
