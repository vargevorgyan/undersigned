"use client";

import { Check, ClipboardCopy, Printer } from "lucide-react";
import { useState } from "react";

export function RiskActions({ questions, vendor }: { questions: string[]; vendor: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `Questions for ${vendor}:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {questions.length > 0 && (
        <button type="button" onClick={copy} className="btn btn-primary">
          {copied ? <Check className="size-4" aria-hidden /> : <ClipboardCopy className="size-4" aria-hidden />}
          {copied ? "Copied" : `Copy ${questions.length} vendor questions`}
        </button>
      )}
      <button type="button" onClick={() => window.print()} className="btn btn-quiet">
        <Printer className="size-4" aria-hidden /> Save as PDF
      </button>
    </div>
  );
}
