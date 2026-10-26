import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: '/admin-dashboard', destination: '/admin' },
      { source: '/size-chart', destination: '/sizechart' },
      { source: '/terms', destination: '/terms-of-service' },
    ];
  },
};

export default nextConfig;
