import type { Metadata } from "next";
import { cookies } from "next/headers";
import { RulesEditor } from "@/components/rules-editor";
import { currentUser } from "@/lib/auth";
import { rulesPayload } from "@/lib/data";

export const metadata: Metadata = { title: "Your rules" };

export default async function RulesPage() {
  const user = await currentUser();
  const data = await rulesPayload(user);
  const anon = (await cookies()).get("pr_rules")?.value;
  const presetIds = !user && anon ? decodeURIComponent(anon).split(",").filter(Boolean) : data.presetIds;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-4xl">Your rules</h1>
      <p className="mt-2 muted">Decide once what's acceptable to you. Every report shows whether a service meets your rules, and alerts tell you when a change breaks one.</p>
      <div className="mt-6">
        <RulesEditor presets={data.presets} presetIds={presetIds} customRules={data.customRules} customLimit={data.limits.customRules} signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
