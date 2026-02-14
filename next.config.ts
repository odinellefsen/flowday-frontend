import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce Clerk logging in development
  env: {
    CLERK_LOGGING: 'false',
    CLERK_DEBUG: 'false',
  },
  devIndicators: false,
  // Explicitly set the workspace root to silence lockfile warning
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "localhost",
    "127.0.0.1",
    "192.168.178.88",
    "http://192.168.178.88:3000",
    "http://192.168.178.88",
    "https://192.168.178.88",
    "https://192.168.178.88:3000",
  ],
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
