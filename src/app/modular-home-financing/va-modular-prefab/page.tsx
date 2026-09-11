import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VA Loans for Modular & Prefab Homes",
  description: "A veteran's complete guide to using VA entitlement on factory-built housing.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="va-modular-prefab"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "VA modular & prefab" },
      ]}
    />
  );
}
