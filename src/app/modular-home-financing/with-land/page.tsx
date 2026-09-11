import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financing a Modular Home With Land",
  description: "Roll lot and home into one construction-to-permanent mortgage when you own or are buying land.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="with-land"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "With land" },
      ]}
    />
  );
}
