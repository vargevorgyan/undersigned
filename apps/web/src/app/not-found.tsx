import Link from "next/link";
import { AnalyzeBox } from "@/components/analyze-box";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl font-semibold">404</p>
      <h1 className="mt-4 text-2xl">We haven't analyzed this one yet</h1>
      <p className="mt-2 muted">Paste its website or app store link and we'll read the fine print now.</p>
      <div className="mt-8"><AnalyzeBox compact /></div>
      <Link href="/directory" className="link mt-6 inline-block text-sm">Browse the directory</Link>
    </div>
  );
}
