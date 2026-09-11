import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VA Construction Loans for Prefab Homes",
  description: "Eligible veterans can finance a modular or prefab build with $0 down.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="construction-loans-va"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Construction Loans", href: "/construction-loans" },
        { name: "VA" },
      ]}
    />
  );
}
