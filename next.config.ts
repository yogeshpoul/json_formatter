import type { NextConfig } from "next";

/**
 * Static export: the build emits plain HTML/CSS/JS into `out/`.
 * There is no server runtime, so no API routes, server actions or
 * server-side JSON processing can exist in production.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
