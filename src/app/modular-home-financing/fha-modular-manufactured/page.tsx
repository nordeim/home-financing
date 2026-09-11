import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FHA Loans for Modular & Manufactured Homes",
  description: "FHA finances both modular and HUD-code homes, with different foundation and title rules.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="fha-modular-manufactured"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "FHA modular & manufactured" },
      ]}
    />
  );
}
