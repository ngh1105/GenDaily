import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x95758c22476ABC199C9A7698bFd083be84A08CF5",
    NEXT_PUBLIC_GENLAYER_NETWORK: process.env.NEXT_PUBLIC_GENLAYER_NETWORK || "studionet",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "GenLayer Daily Check-in",
    NEXT_PUBLIC_GENLAYER_API_URL: process.env.NEXT_PUBLIC_GENLAYER_API_URL || "https://studio.genlayer.com/api",
  },
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
