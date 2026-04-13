import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "intro.js/minified/introjs.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kongoni System - Safari Camp Management",
  description: "Serengeti Safari Camp Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-[#f0f1f4] text-gray-900`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
