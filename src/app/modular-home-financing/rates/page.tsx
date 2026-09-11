import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Mortgage Rates",
  description: "What prefab buyers are seeing on real-property modular files versus HUD-code chattel notes.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="rates"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Rates" },
      ]}
    />
  );
}
