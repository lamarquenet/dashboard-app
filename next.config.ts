import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* other config options can go here */
  allowedDevOrigins: [
    'http://192.168.8.209:3000',
    'http://localhost:3000',
    'http://192.168.8.121:3000',
  ],
};

export default nextConfig;
