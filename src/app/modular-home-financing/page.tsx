import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Financing | Prefab Home Loans & Mortgages",
  description:
    "Get matched with lenders who finance prefab and modular homes. Compare FHA, VA, USDA, conventional, and construction-to-permanent options.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="modular-home-financing"
      crumbs={[{ name: "Home", href: "/" }, { name: "Modular Home Financing" }]}
      crumbsOutside
    />
  );
}
