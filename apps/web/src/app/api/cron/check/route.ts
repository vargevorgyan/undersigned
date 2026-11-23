import { checkDueDocuments } from "@privacy-radar/core";
import { handler, HttpError, json } from "@/lib/api";
import { notifyAlert } from "@/lib/notify";

export const maxDuration = 300;

/** Scheduled change check (Vercel Cron or any scheduler). Protected by CRON_SECRET. */
export const GET = handler(async (req) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) throw new HttpError(401, "Unauthorized");
  if (!secret && process.env.NODE_ENV === "production") throw new HttpError(503, "CRON_SECRET not set");
  return json(await checkDueDocuments({ limit: 25, notify: notifyAlert }));
});
