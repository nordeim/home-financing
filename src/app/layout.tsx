import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/catalog";
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ModFii - Prefab Home Mortgage Marketplace | Get Approved in 7 Days",
    template: "%s | ModFii",
  },
  description: SITE.description,
  keywords: [
    "prefab home financing",
    "modular home mortgage",
    "green mortgage",
    "prefab home loan",
    "energy efficient home financing",
  ],
  authors: [{ name: "ModFii" }],
  openGraph: {
    title: "ModFii - The #1 Prefab Home Mortgage Platform",
    description: "Get pre-approved for your prefab home in 15 minutes. Specialized lenders, green mortgage discounts, 50% faster approvals.",
    type: "website",
    images: ["/brand/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: "ModFii - The #1 Prefab Home Mortgage Platform",
    description: "Get pre-approved for your prefab home in 15 minutes. Specialized lenders, green mortgage discounts, 50% faster approvals.",
    images: ["/brand/og-image.jpg"],
  },
  icons: { icon: "/brand/modfii-logo-icon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
