import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiny Home Financing: How to Finance a Tiny House (2026 Guide)",
  description: "Tiny homes on a permanent foundation can be mortgaged as real property. Wheeled units are usually chattel.",
};

export default function Page() {
  return (
    <GuideScreen guideKey="tiny-home-financing" crumbs={[{ name: "Home", href: "/" }, { name: "Tiny Home Financing" }]} />
  );
}
