import type { NextConfig } from "next";

function normalizeApiBaseForImages(raw: string): string {
  let trimmed = raw.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) trimmed = trimmed.slice(0, -"/api/v1".length);
  if (trimmed.endsWith("/api")) trimmed = trimmed.slice(0, -"/api".length);
  return trimmed;
}

/** Allow Next/Image optimization for CMS media served from the API origin and local dev. */
function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const defaults = [
    { protocol: "https" as const, hostname: "api.erp.zeeshad.com", pathname: "/media/**" },
    // Non-default ports must be listed explicitly (e.g. Laravel on :8000), or /_next/image returns 400.
    { protocol: "http" as const, hostname: "localhost", port: "8000", pathname: "/**" },
    { protocol: "http" as const, hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    { protocol: "http" as const, hostname: "localhost", pathname: "/**" },
    { protocol: "http" as const, hostname: "127.0.0.1", pathname: "/**" },
  ];
  const seen = new Set<string>();
  const out: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  const push = (p: (typeof out)[number]) => {
    const k = `${p.protocol}://${p.hostname}${p.port ?? ""}${p.pathname ?? ""}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(p);
  };
  defaults.forEach(push);
  try {
    const base = normalizeApiBaseForImages(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    );
    const url = new URL(base);
    push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/**",
    });
  } catch {
    /* ignore invalid env */
  }
  return out;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // <--- important for host-built standalone
  poweredByHeader: false,
  compress: true,
  typescript: { ignoreBuildErrors: false },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 88],
    remotePatterns: imageRemotePatterns(),
    // Required for `/_next/image` to fetch from http://localhost / 127.0.0.1 (e.g. Laravel :8000). Off in production to limit SSRF surface.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
