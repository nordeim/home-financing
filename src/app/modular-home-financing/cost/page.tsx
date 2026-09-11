import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Much Does a Modular Home Cost?",
  description: "Complete breakdown of factory invoice, delivery, foundation, site work, and soft costs.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="cost"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Cost" },
      ]}
    />
  );
}
