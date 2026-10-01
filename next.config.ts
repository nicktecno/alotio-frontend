import type { NextConfig } from "next";

const backendUrl =
  process.env.INTERNAL_BACKEND_URL ||
  'https://crooked-fiona-alotio-f8825406.koyeb.app';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
