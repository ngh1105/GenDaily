import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Stub native-only/CLI-only modules pulled by deps in web bundles
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
  redirects: async () => [
    {
      source: '/favicon.ico',
      destination: '/icon.svg',
      permanent: false,
    },
  ],
};

export default nextConfig;
