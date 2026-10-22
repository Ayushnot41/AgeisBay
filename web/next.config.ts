import type { NextConfig } from "next";

const defaultMediator = process.env.VERCEL
  ? "https://pickup-collecting-improved-florist.trycloudflare.com"
  : "http://localhost:8000";

const mediatorUrl = (
  process.env.MEDIATOR_URL ||
  process.env.NEXT_PUBLIC_MEDIATOR_URL ||
  defaultMediator
).replace(/\/$/, "");

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
        destination: `${mediatorUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
