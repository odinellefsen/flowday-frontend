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
}

export default nextConfig;
