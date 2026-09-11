import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prefab vs. Site-Built Costs",
  description: "Modular homes typically cost 10–20% less than comparable site-built houses. Financing should reflect that.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="compare-prefab-sitebuilt"
      crumbs={[{ name: "Home", href: "/" }, { name: "Compare" }, { name: "Prefab vs site-built" }]}
    />
  );
}
