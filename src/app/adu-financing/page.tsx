import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADU Financing",
  description: "Finance a factory-built accessory dwelling unit with lenders who understand ADU appraisals and construction draws.",
};

export default function Page() {
  return <GuideScreen guideKey="adu-financing" crumbs={[{ name: "Home", href: "/" }, { name: "ADU Financing" }]} />;
}
