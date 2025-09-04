import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Evita que erros de lint quebrem o build de produção
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
