import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink font-sans text-ink-foreground">
        {children}
      </body>
    </html>
  );
}
