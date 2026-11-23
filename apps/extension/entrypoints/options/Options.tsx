import { useCallback, useEffect, useState, type FormEvent } from "react";
import { browser } from "wxt/browser";
import { Card, ErrorBox, GhostButton, Logo, PrimaryButton, SecondaryButton, Spinner, Toggle } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useItem } from "@/lib/hooks";
import { anonRulesItem, apiBaseItem, DEFAULT_API_BASE, openWeb, tokenItem } from "@/lib/store";
import type { CustomRule, RulesPayload } from "@/lib/types";
import { AccountView } from "../popup/AccountView";

const refresh = () => void browser.runtime.sendMessage({ type: "refresh" }).catch(() => {});

export function Options() {
  return (
    <div className="options">
      <div className="row">
        <Logo size={30} />
        <div>
          <h1>Undersigned</h1>
          <p className="muted">Your rules, your alerts. Nothing about your browsing leaves this device.</p>
        </div>
      </div>
      <RulesCard />
      <AccountCard />
      <ServerCard />
      <PrivacyCard />
    </div>
  );
}

function RulesCard() {
  const token = useItem(tokenItem);
  const [data, setData] = useState<RulesPayload | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<CustomRule[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const signedIn = Boolean(token);

  const load = useCallback(async () => {
    setError(null);
    try {
      const payload = await api.rules();
      const anon = await anonRulesItem.getValue();
      setData(payload);
      setSelected(signedIn ? payload.presetIds : (anon ?? payload.presetIds));
      setCustom(payload.customRules);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [signedIn]);

  useEffect(() => {
    if (token !== undefined) void load();
  }, [token, load]);

  async function save(presetIds: string[], customRules: { id?: string; text: string }[]) {
    setError(null);
    setUpgrade(null);
    setSaved(false);
    try {
      if (signedIn) {
        const out = await api.saveRules(presetIds, customRules);
        setCustom(out.customRules);
      } else {
        await anonRulesItem.setValue(presetIds);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return true;
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 402) setUpgrade(err.message);
      else setError(err.message);
      return false;
    }
  }

  function togglePreset(id: string, on: boolean) {
    const next = on ? [...selected, id] : selected.filter((x) => x !== id);
    setSelected(next);
    void save(next, custom);
  }

  async function addCustom(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (text.length < 3) return;
    if (await save(selected, [...custom, { text }])) setDraft("");
  }

  async function removeCustom(id: string) {
    const next = custom.filter((r) => r.id !== id);
    setCustom(next);
    await save(selected, next);
  }

  return (
    <Card>
      <div className="row" style={{ marginBottom: 4 }}>
        <h2 className="title grow">Your rules</h2>
        {saved && <span className="success small">Saved ✓</span>}
      </div>
      <p className="muted small" style={{ marginBottom: 8 }}>
        Every site gets checked against these. Turn on what matters to you.
      </p>
      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Spinner />}
      {data?.presets.map((p) => (
        <div key={p.id} className="rule-toggle">
          <div className="grow">
            <div style={{ fontWeight: 600 }}>{p.label}</div>
            <div className="small muted">{p.description}</div>
          </div>
          <Toggle on={selected.includes(p.id)} onChange={(on) => togglePreset(p.id, on)} label={p.label} />
        </div>
      ))}

      {data && (
        <div className="stack" style={{ marginTop: 16, gap: 10 }}>
          <div className="row">
            <div className="section-title grow">Custom rules (checked by AI)</div>
            {signedIn && (
              <span className="small muted">
                {custom.length} of {data.limits.customRules} used
              </span>
            )}
          </div>
          {!signedIn && <div className="notice">Sign in to write your own rules in plain words, like "No sharing my health data".</div>}
          {signedIn &&
            custom.map((r) => (
              <div key={r.id} className="row card" style={{ padding: "8px 12px" }}>
                <div className="grow">{r.text}</div>
                <GhostButton onClick={() => removeCustom(r.id)} aria-label={`Remove rule ${r.text}`}>
                  Remove
                </GhostButton>
              </div>
            ))}
          {signedIn && (
            <form className="row" onSubmit={addCustom}>
              <input className="input grow" placeholder='e.g. "Never share my health data"' maxLength={200} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <PrimaryButton type="submit" disabled={draft.trim().length < 3}>
                Add
              </PrimaryButton>
            </form>
          )}
          {upgrade && (
            <div className="notice row">
              <span className="grow">{upgrade}</span>
              <PrimaryButton onClick={() => openWeb("/pricing")}>Upgrade</PrimaryButton>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function AccountCard() {
  return (
    <Card>
      <h2 className="title">Account</h2>
      <p className="muted small">Sign in to watch services and get alerts when their policies change.</p>
      <div style={{ margin: "0 -14px -14px" }}>
        <AccountView onDone={refresh} />
      </div>
    </Card>
  );
}

function ServerCard() {
  const saved = useItem(apiBaseItem);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (saved !== undefined) setValue(saved);
  }, [saved]);

  async function test() {
    setStatus(null);
    try {
      const { services } = await api.catalog();
      setStatus({ ok: true, text: `Connected ✓ ${services.length} services in catalog` });
    } catch (e) {
      setStatus({ ok: false, text: (e as Error).message });
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    let url: string;
    try {
      url = new URL(value.trim()).origin;
    } catch {
      return setStatus({ ok: false, text: "Enter a full URL like https://undersigned.app" });
    }
    await apiBaseItem.setValue(url);
    refresh();
    await test();
  }

  return (
    <Card>
      <h2 className="title">Server</h2>
      <p className="muted small" style={{ marginBottom: 10 }}>
        Where Undersigned's API runs. Leave the default unless you self-host.
      </p>
      <form className="row" onSubmit={save}>
        <input className="input grow" value={value} onChange={(e) => setValue(e.target.value)} placeholder={DEFAULT_API_BASE} />
        <PrimaryButton type="submit">Save</PrimaryButton>
        <SecondaryButton type="button" onClick={test}>
          Test
        </SecondaryButton>
      </form>
      {status && (
        <p className={status.ok ? "success small" : "small"} style={{ marginTop: 8, color: status.ok ? undefined : "var(--bad)" }}>
          {status.text}
        </p>
      )}
    </Card>
  );
}

function PrivacyCard() {
  return (
    <Card>
      <h2 className="title">How we protect your privacy</h2>
      <ul className="muted" style={{ paddingLeft: 18, margin: "8px 0 0", display: "grid", gap: 6 }}>
        <li>We never collect your browsing history. Badges are computed on your device from a list of graded sites we download every 12 hours. A site's address is sent only when you open the popup on it or tap Analyze.</li>
        <li>A page is only contacted when you click "Analyze", and then only its policy link is sent.</li>
        <li>No ads, no trackers, no selling data. Delete your account any time from the web dashboard.</li>
      </ul>
    </Card>
  );
}
