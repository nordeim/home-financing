import type { NextConfig } from "next";

// Security header contract — mirrors the source site's hardening (probed
// 2026-09-12). Emitted by the app itself (previously these only existed on a
// dev reverse-proxy — see docs/REMEDIATION_PLAN_pass5.md F-02). Stripe +
// Cloudflare Insights allowances keep optional future integrations working.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://api.stripe.com https://cloudflareinsights.com",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/loans/fha", destination: "/modular-home-financing/loan-options/fha", permanent: true },
      { source: "/loans/va", destination: "/modular-home-financing/loan-options/va", permanent: true },
      { source: "/loans/usda", destination: "/modular-home-financing/loan-options/usda", permanent: true },
      { source: "/loans/construction", destination: "/modular-home-financing/loan-options/construction-loan", permanent: true },
      { source: "/manufacturers", destination: "/modular-home-financing/manufacturers", permanent: true },
      { source: "/manufacturers/:slug", destination: "/modular-home-financing/manufacturers/:slug", permanent: true },
      { source: "/states/:state", destination: "/modular-home-financing/states/:state", permanent: true },
      { source: "/get-started-v2", destination: "/get-started", permanent: false },
      { source: "/playbook", destination: "/learn", permanent: false },
      // modfii.com footer links these short compare slugs; the canonical pages
      // here use the -prefab / -costs variants (parity aliases, permanent).
      { source: "/compare/fha-vs-conventional", destination: "/compare/fha-vs-conventional-prefab", permanent: true },
      { source: "/compare/prefab-vs-site-built", destination: "/compare/prefab-vs-site-built-costs", permanent: true },
    ];
  },
};

export default nextConfig;
