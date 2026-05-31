import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Slate.js double-invokes editor effects under Strict Mode, which corrupts
    // its internal WeakMaps. Keep this off until Slate is Strict-Mode-safe.
    reactStrictMode: false,
    
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
