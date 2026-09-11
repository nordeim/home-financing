import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular vs. Manufactured Financing",
  description: "Modular homes follow local codes. Manufactured homes follow the HUD Code. Lenders split along that line.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="compare-modular-manufactured"
      crumbs={[{ name: "Home", href: "/" }, { name: "Compare" }, { name: "Modular vs manufactured" }]}
    />
  );
}
