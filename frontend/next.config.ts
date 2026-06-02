import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan dev server diakses lewat hostname tunnel Cloudflare (acak per sesi UAT).
  // Wildcard subdomain didukung Next.js, jadi tak perlu diubah tiap URL baru.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
