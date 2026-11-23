import { z } from "zod";
import { handler, json, requireUser } from "@/lib/api";
import { markAlertsRead } from "@/lib/data";

export const POST = handler(async (req) => {
  const user = await requireUser();
  const text = await req.text();
  const { ids } = z.object({ ids: z.array(z.string()).optional() }).parse(text ? JSON.parse(text) : {});
  await markAlertsRead(user.id, ids);
  return json({ ok: true });
});
