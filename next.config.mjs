/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "puppeteer",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    // Disable client-side router cache so navigations always get fresh server data
    // Without this, Next.js caches RSC payloads for 30s during SPA navigation
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
