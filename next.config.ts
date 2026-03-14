import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // <--- important for host-built standalone
  poweredByHeader: false,
  compress: true,
  typescript: { ignoreBuildErrors: false },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.erp.zeeshad.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
