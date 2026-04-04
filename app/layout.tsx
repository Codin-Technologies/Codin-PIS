import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIS - Unified Supply Chain",
  description: "Restaurant Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans bg-[#f0f1f4] text-gray-900"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
