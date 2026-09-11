import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "USDA Construction Loans for Modular Homes",
  description: "Zero-down USDA construction financing for income-eligible modular buyers.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="construction-loans-usda"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Construction Loans", href: "/construction-loans" },
        { name: "USDA" },
      ]}
    />
  );
}
