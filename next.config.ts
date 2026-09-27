import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/quinta-do-conde",
        destination:
          "https://condoflow-web.onrender.com/?condominium=quinta-do-conde",
      },
      {
        source: "/quinta-do-conde/admin",
        destination:
          "https://condoflow-web.onrender.com/?condominium=quinta-do-conde&admin=1",
      },
      {
        source: "/quinta-do-conde/cadastro",
        destination:
          "https://condoflow-web.onrender.com/cadastro?condominium=quinta-do-conde",
      },
    ];
  },
};

export default nextConfig;
