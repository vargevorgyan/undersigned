import "./env";
import { checkDueDocuments } from "@privacy-radar/core";

// Manual change check (same as the cron endpoint), printing alerts instead of sending them.
const r = await checkDueDocuments({ limit: Number(process.argv[2] ?? 50), notify: async (a) => console.log(`alert → ${a.email}: ${a.title}`) });
console.log(r);
process.exit(0);
