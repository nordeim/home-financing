import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VA Loans for Modular & Prefab Homes",
  description: "Zero-down VA financing when your modular or prefab home is real property.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="loan-options-va"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Loan options", href: "/modular-home-financing/loan-options" },
        { name: "VA" },
      ]}
    />
  );
}
