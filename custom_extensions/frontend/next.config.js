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
  // Since Nginx will proxy /static_design_images/ from the same domain your frontend is on,
  // Next.js <Image> component should treat these as same-origin.
  // Therefore, images.remotePatterns for your backend might NOT be needed.
  // Try without it first. If Next.js <Image> still complains about unconfigured hostnames for optimization,
  // you might need to add your main domain (the one Nginx serves on port 80) to remotePatterns,
  // or even the 'custom_backend_server' hostname if Next.js optimization somehow sees through the proxy.
  // For now, let's assume it works without remotePatterns due to Nginx making it same-origin.
};

module.exports = nextConfig;
