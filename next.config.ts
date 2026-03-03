import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para build otimizado no Docker/EasyPanel
  output: "standalone",

  // Permite imagens do Appwrite
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "appwrite.grovehub.com.br",
        pathname: "/v1/storage/**",
      },
    ],
  },
};

export default nextConfig;
