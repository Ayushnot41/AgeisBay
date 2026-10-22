import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.MEDIATOR_URL ||
          process.env.NEXT_PUBLIC_MEDIATOR_URL ||
          "https://pickup-collecting-improved-florist.trycloudflare.com"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
