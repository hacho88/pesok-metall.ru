import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ["127.0.0.1", "http://127.0.0.1:52099", "http://localhost:3000"],
};

export default nextConfig;
