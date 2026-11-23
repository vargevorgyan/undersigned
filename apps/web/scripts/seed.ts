import "./env";
import { aiEnabled, analyzeInput } from "@privacy-radar/core";

const TARGETS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "duckduckgo.com", "signal.org", "proton.me", "wikipedia.org", "github.com", "reddit.com", "spotify.com", "netflix.com",
      "tiktok.com", "x.com", "linkedin.com", "pinterest.com", "discord.com", "zoom.us", "dropbox.com", "notion.so",
      "airbnb.com", "uber.com", "paypal.com", "amazon.com", "ebay.com", "etsy.com", "shopify.com", "slack.com",
      "https://play.google.com/store/apps/details?id=com.whatsapp",
      "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically",
      "https://apps.apple.com/us/app/instagram/id389801252",
      "https://apps.apple.com/us/app/telegram-messenger/id686449807",
    ];

console.log(`Seeding ${TARGETS.length} services (${aiEnabled() ? "AI" : "basic"} analysis)…`);
let ok = 0;
for (const t of TARGETS) {
  const started = Date.now();
  try {
    const { slug } = await analyzeInput(t);
    ok++;
    console.log(`✓ ${t} → /s/${slug} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  } catch (err) {
    console.log(`✗ ${t}: ${(err as { userMessage?: string }).userMessage ?? (err as Error).message}`);
  }
}
console.log(`Done: ${ok}/${TARGETS.length}`);
process.exit(0);
