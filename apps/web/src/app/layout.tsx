import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { getAlerts } from "@/lib/data";
import { appUrl } from "@/lib/api";
import { Logo } from "@/components/ui";
import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "Undersigned: know what you sign", template: "%s · Undersigned" },
  description: "AI reads privacy policies and terms for you, checks them against your own rules, and alerts you when they change. Websites, Android and iPhone apps.",
  openGraph: { siteName: "Undersigned", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1012" },
  ],
};

const navLink = "rounded-md px-3 py-2 text-[15px] font-medium transition-colors hover:bg-[var(--surface-2)]";

async function Header() {
  const user = await currentUser().catch(() => null);
  const unread = user ? (await getAlerts(user.id, 1)).unread : 0;
  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--bg)]/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-4 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2.5 font-serif text-[21px] font-medium tracking-[-0.015em]" translate="no">
          <Logo className="size-8" />
          Undersigned
        </Link>
        <Link href="/directory" className={`${navLink} hidden sm:block`}>Directory</Link>
        <Link href="/teams" className={`${navLink} hidden sm:block`}>For teams</Link>
        <Link href="/pricing" className={`${navLink} hidden sm:block`}>Pricing</Link>
        {user ? (
          <>
            <Link href="/dashboard#alerts" className="relative rounded-md p-2 hover:bg-[var(--surface-2)]" aria-label={`Alerts, ${unread} unread`}>
              <Bell className="size-5" aria-hidden />
              {unread > 0 && (
                <span className="tabular absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-redpen px-1 text-[11px] font-bold leading-[18px] text-white">{unread}</span>
              )}
            </Link>
            <Link href="/settings" className="rounded-md p-2 hover:bg-[var(--surface-2)]" aria-label="Settings">
              <Settings className="size-5" aria-hidden />
            </Link>
            <Link href="/dashboard" className="btn btn-ink ml-1 py-2">Dashboard</Link>
          </>
        ) : (
          <>
            <Link href="/login" className={navLink}>Sign in</Link>
            <Link href="/signup" className="btn btn-primary ml-1 py-2">Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-28 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-[15px] sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div>
          <div className="flex items-center gap-2.5 font-serif text-[19px] font-medium tracking-[-0.015em]" translate="no">
            <Logo className="size-6" /> Undersigned
          </div>
          <p className="mt-3 max-w-sm muted">Plain-language summaries of privacy policies and terms. A guide, not legal advice: every finding quotes the original text.</p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Product">
          <span className="label">Product</span>
          <Link href="/directory" className="hover:underline">Directory</Link>
          <Link href="/download" className="hover:underline">Extension and app</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
        </nav>
        <nav className="flex flex-col gap-2" aria-label="Our policies">
          <span className="label">Our own fine print</span>
          <Link href="/privacy" className="hover:underline">Privacy policy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${plexMono.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh font-sans text-[16px] leading-normal">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--surface)] focus:p-3">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
