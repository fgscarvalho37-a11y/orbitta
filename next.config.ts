import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "https://orbitta-api.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
