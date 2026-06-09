import type { NextConfig } from "next";

// Security headers applied to every response. We set the non-breaking, high-value
// ones: anti-clickjacking (frame-ancestors + X-Frame-Options), MIME-sniffing
// protection, HSTS, a tight referrer policy, and a Permissions-Policy that still
// allows camera/mic on our own origin (needed for host broadcasting via LiveKit).
// A full resource-restricting CSP (script-src/connect-src) is intentionally left
// for a tested follow-up, since it can break WebRTC/realtime if mis-scoped.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), browsing-topics=(), camera=(self), microphone=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
