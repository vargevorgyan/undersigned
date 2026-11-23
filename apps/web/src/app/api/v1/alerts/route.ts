import { handler, json, requireUser } from "@/lib/api";
import { getAlerts } from "@/lib/data";

export const GET = handler(async () => {
  const user = await requireUser();
  return json(await getAlerts(user.id));
});
