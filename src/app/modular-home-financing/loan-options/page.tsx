import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Loan Options",
  description: "FHA, VA, USDA, conventional, and construction-to-permanent loans for modular and prefab homes.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="loan-options"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Loan options" },
      ]}
    />
  );
}
