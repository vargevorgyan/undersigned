import { eq } from "drizzle-orm";
import { getUserRules } from "@privacy-radar/core";
import { alerts, getDb } from "@privacy-radar/core/db";
import { handler, requireUser } from "@/lib/api";
import { publicUser } from "@/lib/auth";
import { getWatchlist } from "@/lib/data";

export const GET = handler(async () => {
  const user = await requireUser();
  const db = await getDb();
  const data = {
    exportedAt: new Date(),
    account: publicUser(user),
    rules: await getUserRules(db, user.id),
    watchlist: await getWatchlist(user.id),
    alerts: await db.select().from(alerts).where(eq(alerts.userId, user.id)),
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="privacy-radar-data.json"' },
  });
});
