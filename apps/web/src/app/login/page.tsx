import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/ui";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function Page() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-8 text-center">
        <Logo className="mx-auto size-10" />
        <h1 className="mt-4 text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm muted">Sign in to see your watchlist and alerts.</p>
      </div>
      <div className="panel">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
