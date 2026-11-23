import { z } from "zod";
import { body, handler, json, requireUser } from "@/lib/api";
import { currentUser } from "@/lib/auth";
import { rulesPayload, saveRules } from "@/lib/data";

export const GET = handler(async () => json(await rulesPayload(await currentUser())));

const Schema = z.object({
  presetIds: z.array(z.string()).max(50),
  customRules: z.array(z.object({ id: z.string().optional(), text: z.string().max(200) })).max(100),
});

export const PUT = handler(async (req) => {
  const user = await requireUser();
  const input = await body(req, Schema);
  await saveRules(user, input.presetIds, input.customRules);
  return json(await rulesPayload(user));
});
