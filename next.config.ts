import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce Clerk logging in development
  env: {
    CLERK_LOGGING: 'false',
    CLERK_DEBUG: 'false',
  },
  // Explicitly set the workspace root to silence lockfile warning
  turbopack: {
    root: __dirname,
  },
  // PWA configuration
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
}

export default nextConfig;
