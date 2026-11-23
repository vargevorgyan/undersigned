import type { Metadata } from "next";
import { getServiceView } from "@privacy-radar/core";
import { Deck } from "@/components/deck/deck";
import { DOC_LABELS, gradeLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Presentation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PresentPage() {
  // The case-study numbers come from the live Spotify report.
  const view = await getServiceView("spotify-com").catch(() => null);
  const docs = (view?.documents ?? [])
    .filter((d) => d.version)
    .map((d) => ({ label: DOC_LABELS[d.type] ?? "Document", grade: d.version!.analysis.grade, words: d.version!.wordCount }));
  const grade = view?.service.grade ?? "D";
  return <Deck data={{ grade, gradeLabel: gradeLabel(grade), docs }} />;
}
