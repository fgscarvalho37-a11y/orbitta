import type { NextConfig } from "next";

const CONDOFLOW_FRONTEND = "https://condoflow-web.onrender.com";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/condoflow/_expo/:path*",
        destination: `${CONDOFLOW_FRONTEND}/_expo/:path*`,
      },
      {
        source: "/condoflow/assets/:path*",
        destination: `${CONDOFLOW_FRONTEND}/assets/:path*`,
      },
      {
        source: "/condoflow/:condominium",
        destination:
          `${CONDOFLOW_FRONTEND}/?condominium=:condominium`,
      },
      {
        source: "/condoflow/:condominium/:path*",
        destination:
          `${CONDOFLOW_FRONTEND}/:path*?condominium=:condominium`,
      },
    ];
  },
};

export default nextConfig;
