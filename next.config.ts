import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.*"],
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "development" ? ["127.0.0.*"] : [],
    },
  },
};

export default nextConfig;
