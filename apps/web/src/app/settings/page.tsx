import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings-panel";
import { currentUser, publicUser } from "@/lib/auth";
import { limitsFor } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/settings");
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-4xl">Settings</h1>
      <SettingsPanel user={{ ...publicUser(user), createdAt: String(user.createdAt) }} limits={limitsFor(user)} />
    </div>
  );
}
