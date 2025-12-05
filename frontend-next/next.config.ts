import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/flights/:path*',
        destination: 'http://localhost:5001/api/flights/:path*',
      },
      {
        source: '/api/airports/:path*',
        destination: 'http://localhost:5001/api/airports/:path*',
      },
      {
        source: '/api/user-location/:path*',
        destination: 'http://localhost:5001/api/user-location/:path*',
      },
      {
        source: '/api/whatsapp/:path*',
        destination: 'http://localhost:5001/api/whatsapp/:path*',
      },
      {
        source: '/api/email/:path*',
        destination: 'http://localhost:5001/api/email/:path*',
      },
    ];
  },
};

export default nextConfig;

