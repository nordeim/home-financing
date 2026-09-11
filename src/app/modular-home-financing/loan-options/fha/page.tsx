import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FHA Loans for Modular Homes",
  description: "Low down payment FHA financing for modular and manufactured homes on permanent foundations.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="loan-options-fha"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Loan options", href: "/modular-home-financing/loan-options" },
        { name: "FHA" },
      ]}
    />
  );
}
