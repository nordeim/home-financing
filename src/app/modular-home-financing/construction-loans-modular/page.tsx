import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Loans for Modular Homes",
  description: "How modular construction loans differ from stick-built draw schedules.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="construction-loans-modular"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Modular construction loans" },
      ]}
    />
  );
}
