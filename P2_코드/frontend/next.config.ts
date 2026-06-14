import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    if (!backendOrigin) return [];
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/backend-health",
        destination: `${backendOrigin}/health`,
      },
    ];
  },
};

export default nextConfig;
