import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financing a Modular Home Without Land",
  description: "Sequence the lot, then the factory—or buy into a builder community.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="without-land"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Without land" },
      ]}
    />
  );
}
