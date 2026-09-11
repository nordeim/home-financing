import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FHA vs. Conventional for Prefab",
  description: "When FHA's 3.5% down beats conventional, and when dropping PMI makes conventional cheaper.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="compare-fha-conventional"
      crumbs={[{ name: "Home", href: "/" }, { name: "Compare" }, { name: "FHA vs conventional" }]}
    />
  );
}
