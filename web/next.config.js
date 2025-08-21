// /home/dev/onyx/web/next.config.js

// Get Onyx Web Version
const { version: package_version } = require("./package.json"); // version from package.json
const env_version = process.env.ONYX_VERSION; // version from env variable
// Use env version if set & valid, otherwise default to package version
const version = env_version || package_version;

// Always require withSentryConfig
const { withSentryConfig } = require("@sentry/nextjs");

const cspHeader = `
    style-src 'self' 'unsafe-inline';
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    ${
      process.env.NEXT_PUBLIC_CLOUD_ENABLED === "true"
        ? "upgrade-insecure-requests;"
        : ""
    }
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  output: "standalone",
  publicRuntimeConfig: {
    version,
  },
  images: {
    // Used to fetch favicons
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
        pathname: "/s2/favicons/**",
      },
    ],
    unoptimized: true, // Disable image optimization to avoid requiring Sharp
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
    // Keep the specific rules for docs/openapi first
    {
      source: "/api/docs/:path*", 
      destination: `${process.env.INTERNAL_URL || "http://localhost:8080"}/docs/:path*`,
    },
    {
      source: "/api/docs", 
      destination: `${process.env.INTERNAL_URL || "http://localhost:8080"}/docs`,
    },
    {
      source: "/openapi.json",
      destination: `${process.env.INTERNAL_URL || "http://localhost:8080"}/openapi.json`,
    },
    // ------
    // Proxy custom-projects-backend requests to the custom backend
    {
      source: '/api/custom-projects-backend/:path*',
      destination: 'http://custom_backend:8001/api/custom-projects-backend/:path*'
    },
    // ------
    // Proxy all other /api/* requests to the backend api_server
    {
      source: '/api/:path*', // Match any path starting with /api/
      destination: 'http://api_server:8080/api/:path*'  // Proxy it
    }
    // --------------------
  ];
  },
};

// Sentry configuration (remains the same)
const sentryEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.NEXT_PUBLIC_SENTRY_DSN
);

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || "onyx",
  project: process.env.SENTRY_PROJECT || "data-plane-web",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !sentryEnabled,
  dryRun: !sentryEnabled,
  ...(sentryEnabled && {
    sourceMaps: {
      include: ["./.next"],
      ignore: ["node_modules"],
      urlPrefix: "~/_next",
      stripPrefix: ["webpack://_N_E/"],
      validate: true,
      cleanArtifacts: true,
    },
  }),
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
