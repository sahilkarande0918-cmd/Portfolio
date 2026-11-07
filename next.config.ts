import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/work", destination: "/#work", permanent: false },
      { source: "/my-story", destination: "/#story", permanent: false },
    ];
  },
};

export default nextConfig;
