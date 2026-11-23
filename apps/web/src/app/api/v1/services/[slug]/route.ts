import { getServiceView } from "@privacy-radar/core";
import { handler, HttpError, json } from "@/lib/api";
import { currentUser } from "@/lib/auth";

/** Service report. Signed-in users get a verdict against their rules; anonymous clients may pass ?rules=a,b. */
export const GET = handler(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const user = await currentUser();
  const rules = new URL(req.url).searchParams.get("rules");
  const view = await getServiceView(slug, { userId: user?.id, presetIds: rules ? rules.split(",").filter(Boolean) : undefined });
  if (!view) throw new HttpError(404, "We haven't analyzed this service yet.");
  return json(view);
});
