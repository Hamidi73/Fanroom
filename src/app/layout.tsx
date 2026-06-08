import type { Metadata } from "next";
import { Anton, Outfit } from "next/font/google";
import "./globals.css";

// Body font (variable) and the condensed display font used by `.display`.
// Self-hosted automatically by next/font — no external Google Fonts request.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
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
    <html
      lang="en"
      className={`${outfit.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-sans text-ink-foreground">
        {children}
      </body>
    </html>
  );
}
