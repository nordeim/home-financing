import { GuideView } from "@/components/page-shell";
import { getGuide } from "@/lib/guides";
import { notFound } from "next/navigation";

export function GuideScreen({
  guideKey,
  crumbs,
}: {
  guideKey: string;
  crumbs: Array<{ name: string; href?: string }>;
}) {
  const guide = getGuide(guideKey);
  if (!guide) notFound();
  return (
    <main>
      <GuideView guide={guide} crumbs={crumbs} />
    </main>
  );
}
