import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prefab & Modular Financing",
  description: "A marketplace built only for factory-built housing, with green mortgage discounts and specialist desks.",
};

export default function Page() {
  return <GuideScreen guideKey="financing" crumbs={[{ name: "Home", href: "/" }, { name: "Financing" }]} />;
}
