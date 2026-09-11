import { GuideScreen } from "@/components/guide-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chattel vs. Mortgage Loans",
  description: "Chattel is personal property. Mortgages are real estate. Classification decides your rate.",
};

export default function Page() {
  return (
    <GuideScreen
      guideKey="chattel-vs-mortgage"
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Modular financing", href: "/modular-home-financing" },
        { name: "Chattel vs mortgage" },
      ]}
    />
  );
}
