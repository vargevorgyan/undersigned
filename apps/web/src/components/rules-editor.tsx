"use client";

import { Check, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomRule, PresetRule } from "@privacy-radar/core/rules";
import { api, ApiError, saveAnonRules } from "@/lib/client";
import { UpgradeDialog } from "./service-actions";
import { cx } from "./ui";

type Props = { presets: PresetRule[]; presetIds: string[]; customRules: CustomRule[]; customLimit: number; signedIn: boolean };

const IDEAS = ["Don't share my health data", "No selling data to data brokers", "Let me opt out of personalized ads", "Delete my data within 30 days of closing my account"];

export function RulesEditor(props: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set(props.presetIds));
  const [custom, setCustom] = useState(props.customRules);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState<string | null>(null);

  async function save(nextSelected = selected, nextCustom = custom) {
    setState("saving");
    setError("");
    try {
      if (props.signedIn) await api("/rules", { method: "PUT", body: { presetIds: [...nextSelected], customRules: nextCustom } });
      else saveAnonRules([...nextSelected]);
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } catch (err) {
      setState("idle");
      if (err instanceof ApiError && err.status === 402) setUpgrade(err.message);
      else setError((err as Error).message);
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    save(next);
  }

  function addCustom(text: string) {
    const clean = text.trim();
    if (clean.length < 3) return;
    if (custom.length >= props.customLimit) return setUpgrade(`Free accounts can add ${props.customLimit} custom rules. Upgrade to Pro for more.`);
    const next = [...custom, { id: crypto.randomUUID().slice(0, 8), text: clean }];
    setCustom(next);
    setDraft("");
    save(selected, next);
  }

  function removeCustom(id: string) {
    const next = custom.filter((r) => r.id !== id);
    setCustom(next);
    save(selected, next);
  }

  return (
    <div className="space-y-8">
      <div className="flex h-6 items-center justify-end text-sm" aria-live="polite">
        {state === "saving" && <span className="inline-flex items-center gap-1.5 muted"><Loader2 className="size-3.5 animate-spin" /> Saving…</span>}
        {state === "saved" && <span className="inline-flex items-center gap-1.5 text-pass"><Check className="size-3.5" /> Saved</span>}
        {error && <span className="text-fail">{error}</span>}
      </div>

      <section>
        <h2 className="">Quick rules</h2>
        <p className="mt-1 text-sm muted">Tap to turn on. These are checked instantly on every service.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {props.presets.map((r) => {
            const on = selected.has(r.id);
            return (
              <button
                key={r.id}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => toggle(r.id)}
                className={cx("panel flex items-start gap-3 !p-4 text-left transition-[border-color,box-shadow]", on ? "!border-[var(--text)] ring-1 ring-[var(--text)]" : "hover:border-[var(--muted)]")}
              >
                <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition", on ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "")}>
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span>
                  <span className="block font-semibold">{r.label}</span>
                  <span className="block text-sm muted">{r.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="">Your own rules, in plain words</h2>
        <p className="mt-1 text-sm muted">Write anything you care about. AI checks it against each policy.</p>
        {!props.signedIn ? (
          <div className="panel mt-4 flex items-center gap-3 !p-4 text-sm">
            <Lock className="size-4 muted" />
            <span className="flex-1">Custom rules need a free account.</span>
            <Link href="/signup?next=/rules" className="btn btn-primary py-2">Sign up free</Link>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {custom.map((r) => (
                <li key={r.id} className="panel flex items-center gap-3 !p-3.5">
                  <span className="flex-1">{r.text}</span>
                  <button onClick={() => removeCustom(r.id)} className="rounded-lg p-1.5 muted hover:bg-fail/10 hover:text-fail" aria-label={`Remove rule: ${r.text}`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCustom(draft);
              }}
            >
              <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} placeholder="e.g. Don't share my health data with anyone" className="input" aria-label="New custom rule" />
              <button className="btn btn-ink shrink-0" disabled={draft.trim().length < 3}>
                <Plus className="size-4" /> Add
              </button>
            </form>
            <p className="mt-2 text-xs muted">
              {custom.length} of {props.customLimit} used
            </p>
            {custom.length === 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {IDEAS.map((i) => (
                  <button key={i} type="button" onClick={() => addCustom(i)} className="chip transition hover:bg-[var(--border)]">
                    + {i}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
      {upgrade && <UpgradeDialog message={upgrade} onClose={() => setUpgrade(null)} />}
    </div>
  );
}
