import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to NestJS backend in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
