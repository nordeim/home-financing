import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "USDA Loans for Modular Homes",
  description: "Zero-down rural development loans for income-eligible modular buyers.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="loan-options-usda"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Loan options", href: "/modular-home-financing/loan-options" },
        { name: "USDA" },
      ]}
    />
  );
}
