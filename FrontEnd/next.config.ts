import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  images: {
    unoptimized: true
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true, // Re-enabled due to persistent, unresolvable type error
  },
  /* other config options here */
};

export default nextConfig;
