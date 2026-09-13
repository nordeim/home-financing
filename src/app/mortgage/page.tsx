import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Mortgage | Compare Rates from 50+ Lenders",
  description: "How prefab and modular homes are mortgaged as real property, and when chattel still applies.",
};

export default function Page() {
  return <GuideScreen guideKey="mortgage" crumbs={[{ name: "Home", href: "/" }, { name: "Mortgage" }]} />;
}
