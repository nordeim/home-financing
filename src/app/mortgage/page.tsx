import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prefab Home Mortgages",
  description: "How prefab and modular homes are mortgaged as real property, and when chattel still applies.",
};

export default function Page() {
  return <GuideScreen guideKey="mortgage" crumbs={[{ name: "Home", href: "/" }, { name: "Mortgage" }]} />;
}
