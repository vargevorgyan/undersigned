import { useState } from "react";
import { BackIcon, BellIcon, Logo, UserIcon } from "@/components/ui";
import { useItem } from "@/lib/hooks";
import { tokenItem, unreadItem } from "@/lib/store";
import { AccountView } from "./AccountView";
import { AlertsView } from "./AlertsView";
import { SiteView } from "./SiteView";

export type View = { name: "site" } | { name: "alerts" } | { name: "account"; reason?: string };

export function App() {
  const [view, setView] = useState<View>({ name: "site" });
  const unread = useItem(unreadItem) ?? 0;
  const token = useItem(tokenItem);
  const toSite = () => setView({ name: "site" });

  return (
    <div className="popup">
      <header className="header">
        {view.name === "site" ? (
          <div className="logo">
            <Logo />
            Undersigned
          </div>
        ) : (
          <div className="logo">
            <button className="icon-btn" onClick={toSite} aria-label="Back">
              <BackIcon />
            </button>
            {view.name === "alerts" && "Alerts"}
            {view.name === "account" && "Account"}
          </div>
        )}
        {token && (
          <button className="icon-btn" onClick={() => setView({ name: "alerts" })} aria-label={`Alerts, ${unread} unread`}>
            <BellIcon />
            {unread > 0 && <span className="dot-count">{Math.min(unread, 99)}</span>}
          </button>
        )}
        <button className="icon-btn" onClick={() => setView({ name: "account" })} aria-label="Account">
          <UserIcon />
        </button>
      </header>

      {view.name === "site" && <SiteView onNeedAccount={(reason) => setView({ name: "account", reason })} />}
      {view.name === "alerts" && <AlertsView />}
      {view.name === "account" && <AccountView reason={view.reason} onDone={toSite} />}

      <footer className="footer">
        <Logo size={12} />
        Badges are computed on your device. We only see a site when you open this popup or tap Analyze.
      </footer>
    </div>
  );
}
