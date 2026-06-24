import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MiniPlayerShell } from "@/app/components/MiniPlayerShell";

// One clean variable font for the whole UI (body + headings). Self-hosted
// automatically by next/font — no external Google Fonts request.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FanRoom Global — World Cup 2026 fan rooms",
  description:
    "Find your nation and join creator-led World Cup fan rooms. Reactions, commentary and community — never match footage.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Apply the saved light/dark preference before first paint so there's
            no flash of the wrong theme (the toggle writes localStorage.theme).
            Default is dark — the brand look — when nothing is stored. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-ink font-sans text-ink-foreground">
        {children}
        {/* Floating mini-player: keeps your room's stream (and a host's
            broadcast) running while you browse the rest of the site.
            Lazy-loaded via MiniPlayerShell so LiveKit doesn't inflate every page. */}
        <MiniPlayerShell />
      </body>
    </html>
  );
}
