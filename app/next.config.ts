import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
