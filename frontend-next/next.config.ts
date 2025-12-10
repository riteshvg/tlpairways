import type { NextConfig } from "next";

// Backend API URL - use env var in production, localhost in development
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/flights/:path*',
        destination: `${API_URL}/api/flights/:path*`,
      },
      {
        source: '/api/airports/:path*',
        destination: `${API_URL}/api/airports/:path*`,
      },
      {
        source: '/api/user-location/:path*',
        destination: `${API_URL}/api/user-location/:path*`,
      },
      {
        source: '/api/whatsapp/:path*',
        destination: `${API_URL}/api/whatsapp/:path*`,
      },
      {
        source: '/api/email/:path*',
        destination: `${API_URL}/api/email/:path*`,
      },
    ];
  },
};

export default nextConfig;

