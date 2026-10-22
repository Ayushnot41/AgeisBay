import "./patch-readlink.js";
import type { NextConfig } from "next";
import path from "path";

const __dirname = import.meta.dirname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.MEDIATOR_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
