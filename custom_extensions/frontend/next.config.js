// custom_extensions/frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // CRITICAL: Set the basePath for your custom frontend
  basePath: '/custom-projects-ui',

  // assetPrefix: '/custom-projects-ui', // Usually, basePath is sufficient. Test first.

  // API Rewrites are NOT strictly needed here if Nginx handles all proxying from root paths.
  // Your frontend API calls should use absolute paths like /api/custom-projects-backend/...
  // which Nginx will catch.

  // Image Optimization:
  images: {
    unoptimized: true, // Disable Next.js image optimization to avoid basePath issues
  },
};

module.exports = nextConfig;
