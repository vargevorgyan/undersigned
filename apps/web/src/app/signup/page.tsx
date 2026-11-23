import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/ui";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up" };

export default async function Page() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-8 text-center">
        <Logo className="mx-auto size-10" />
        <h1 className="mt-4 text-2xl">Create your free account</h1>
        <p className="mt-1 text-sm muted">Save your rules, watch up to 3 services, and get alerts when their policies change.</p>
      </div>
      <div className="panel">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
