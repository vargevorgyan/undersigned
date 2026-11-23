/** Local/dev scheduler: runs change checks in-process. Production uses /api/cron/check via a real cron. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.INTERNAL_CRON === "false") return;
  if (process.env.NODE_ENV === "production" && process.env.INTERNAL_CRON !== "true") return;
  const minutes = Number(process.env.INTERNAL_CRON_MINUTES ?? 15);
  const run = async () => {
    try {
      const { checkDueDocuments } = await import("@privacy-radar/core");
      const { notifyAlert } = await import("./lib/notify");
      const r = await checkDueDocuments({ limit: 10, notify: notifyAlert });
      if (r.checked) console.log(`[cron] checked=${r.checked} changed=${r.changed} alerts=${r.alerts} failed=${r.failed}`);
    } catch (e) {
      console.error("[cron] failed", e);
    }
  };
  setTimeout(run, 30_000);
  setInterval(run, minutes * 60_000);
}
