import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce Clerk logging in development
  env: {
    CLERK_LOGGING: 'false',
    CLERK_DEBUG: 'false',
  },
}

export default nextConfig;
