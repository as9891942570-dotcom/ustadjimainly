import type { NextConfig } from "next";
import path from "path";

const SERVICE_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://mistripoint-1.onrender.com";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "https://mistripoint-backend-1.onrender.com/:path*",
      },
      {
        source: "/worker-api/:path*",
        destination: `${SERVICE_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
