import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slate.js double-invokes editor effects under Strict Mode, which corrupts
  // its internal WeakMaps. Keep this off until Slate is Strict-Mode-safe.
  reactStrictMode: false,

  // Static export (GitHub Pages). When a backend lands, swap this out and
  // move data access behind the workspace repository seam in lib/workspace.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
