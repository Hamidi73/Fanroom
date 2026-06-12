import type { NextConfig } from "next";

// Content-Security-Policy. Scoped to what the app actually needs:
//   • script-src: self + inline (Next injects inline hydration scripts and has
//     no nonce pipeline) + 'wasm-unsafe-eval' and blob: for the ffmpeg.wasm
//     clip engine (loaded as a same-origin blob worker).
//   • connect-src: https:/wss: so Supabase (REST + realtime) and LiveKit (WebRTC
//     signalling) work without enumerating hosts that vary by environment.
//   • worker-src blob: for the ffmpeg worker; media/img/font cover video,
//     flags, stickers and fonts. frame-ancestors/base-uri/object-src stay tight.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

// Security headers applied to every response: anti-clickjacking (CSP
// frame-ancestors + X-Frame-Options), MIME-sniffing protection, HSTS, a tight
// referrer policy, a Permissions-Policy that still allows camera/mic on our own
// origin (host broadcasting via LiveKit), and the resource CSP above.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), browsing-topics=(), camera=(self), microphone=(self)",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
