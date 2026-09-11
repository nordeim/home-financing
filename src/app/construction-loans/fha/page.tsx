import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FHA Construction Loans for Modular Homes",
  description: "Use an FHA construction-to-permanent loan to build a modular home with 3.5% down.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="construction-loans-fha"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Construction Loans", href: "/construction-loans" },
        { name: "FHA" },
      ]}
    />
  );
}
