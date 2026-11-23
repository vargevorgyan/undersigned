"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client";
import { cx } from "./ui";

export function WaitlistForm({ source, dark }: { source: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | string>("idle");

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium">
        <Check className="size-4" /> You're on the list. We'll email you once, at launch.
      </p>
    );
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        try {
          await api("/waitlist", { body: { email, source } });
          setState("done");
        } catch (err) {
          setState((err as Error).message);
        }
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className={cx("input py-2.5", dark && "!border-current/30 !bg-transparent placeholder:text-current placeholder:opacity-50")}
      />
      <button className={cx("btn shrink-0", dark ? "btn-primary" : "btn-ink")} disabled={state === "sending"}>
        Notify me
      </button>
      {state !== "idle" && state !== "sending" && <span className="sr-only" role="alert">{state}</span>}
    </form>
  );
}
