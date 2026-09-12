import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Loans for Modular & Prefab Homes",
  description: "Finance factory production, delivery, and site work with construction-to-permanent loans.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="construction-loans"
      crumbs={[{ name: "Home", href: "/" }, { name: "Construction Loans" }]}
    />
  );
}
