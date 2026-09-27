import type { NextConfig } from "next";

const CONDOFLOW_WEB = "https://condoflow-web.onrender.com";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // Expo's exported HTML loads its JS/assets from root paths.
      // Proxy those too, otherwise the tenant page renders as a blank screen.
      {
        source: "/_expo/:path*",
        destination: `${CONDOFLOW_WEB}/_expo/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${CONDOFLOW_WEB}/assets/:path*`,
      },
      {
        source: "/quinta-do-conde",
        destination:
          `${CONDOFLOW_WEB}/?condominium=quinta-do-conde`,
      },
      {
        source: "/quinta-do-conde/admin",
        destination:
          `${CONDOFLOW_WEB}/?condominium=quinta-do-conde&admin=1`,
      },
      {
        source: "/quinta-do-conde/cadastro",
        destination:
          `${CONDOFLOW_WEB}/cadastro?condominium=quinta-do-conde`,
      },
    ];
  },
};

export default nextConfig;
