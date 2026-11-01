import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.*"],
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "development" ? ["127.0.0.*"] : [],
    },
  },
};

export default withNextIntl(nextConfig);
