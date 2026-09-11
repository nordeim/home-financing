import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction-to-Permanent Modular Loans",
  description:
    "One-time close construction loans for modular homes. Finance factory build, delivery, and site work with a single closing.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="loan-options-construction"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Loan options", href: "/modular-home-financing/loan-options" },
        { name: "Construction loan" },
      ]}
    />
  );
}
