import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roastify | AI Music Roast",
  description: "Get your Spotify taste roasted by an AI that holds nothing back.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0302] text-[#fef2ef] selection:bg-[#ff4500] selection:text-white">
        {children}
      </body>
    </html>
  );
}
