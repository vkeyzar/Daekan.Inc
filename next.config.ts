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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'corhxzcsgvcckigxleeo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
      ],
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
