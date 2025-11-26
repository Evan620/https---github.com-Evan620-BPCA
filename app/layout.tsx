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
  title: "Building Plan Compliance Analysis",
  description: "AI-powered building plan compliance analysis platform",
};

import { Providers } from "@/components/providers"
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        <Providers>
          <PageLoadingIndicator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
