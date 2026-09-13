import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Down Payment Options | 0% Down Available",
  description: "FHA 3.5%, conventional 3–20%, VA 0%, USDA 0% — program minimums for modular buyers.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="down-payment"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Down payment" },
      ]}
    />
  );
}
