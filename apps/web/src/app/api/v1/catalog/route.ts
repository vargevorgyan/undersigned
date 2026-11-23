import { catalog } from "@privacy-radar/core";
import { handler, json } from "@/lib/api";

/** Domain → grade list the extension caches to show badges without sending browsing data. */
export const GET = handler(async () => json({ services: await catalog(), updatedAt: new Date() }, { headers: { "cache-control": "public, max-age=3600" } }));
