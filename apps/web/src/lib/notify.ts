import "server-only";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import type { Notifier } from "@privacy-radar/core";
import { alerts, getDb, pushTokens } from "@privacy-radar/core/db";
import { appUrl } from "./api";

let transport: ReturnType<typeof nodemailer.createTransport> | null | undefined;
function mailer() {
  if (transport === undefined) transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;
  return transport;
}

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  const t = mailer();
  if (!t) {
    console.log(`[email:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  await t.sendMail({ from: process.env.EMAIL_FROM ?? "Undersigned <alerts@undersigned.app>", to, subject, text, html });
}

async function sendPush(userId: string, title: string, body: string, slug: string) {
  const db = await getDb();
  const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
  if (tokens.length === 0) return;
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(tokens.map((t) => ({ to: t.token, title, body, sound: "default", data: { slug } }))),
  });
  // Expo reports invalid tokens per message; drop them so we stop retrying.
  const out = (await res.json().catch(() => null)) as { data?: { status: string; details?: { error?: string } }[] } | null;
  for (const [i, r] of (out?.data ?? []).entries()) {
    if (r.details?.error === "DeviceNotRegistered") await db.delete(pushTokens).where(eq(pushTokens.token, tokens[i]!.token));
  }
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export const notifyAlert: Notifier = async (a) => {
  const link = `${appUrl()}/s/${a.slug}?alert=${a.alertId}`;
  await sendPush(a.userId, a.title, a.body, a.slug).catch((e) => console.error("push failed", e));
  if (!a.emailAlerts) return;
  const color = a.impact === "worse" ? "#dc2626" : "#2563eb";
  await sendEmail(
    a.email,
    a.title,
    `${a.title}\n\n${a.body}\n\nSee what changed: ${link}\n\nManage alerts: ${appUrl()}/settings`,
    `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px">
      <p style="font-size:13px;color:#64748b;margin:0 0 8px">Undersigned alert</p>
      <h1 style="font-size:20px;margin:0 0 12px;color:${color}">${escape(a.title)}</h1>
      <p style="font-size:15px;line-height:1.5;color:#0f172a">${escape(a.body)}</p>
      <a href="${link}" style="display:inline-block;margin-top:16px;background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">See what changed</a>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px"><a href="${appUrl()}/settings" style="color:#94a3b8">Manage alerts</a></p>
    </div>`,
  );
  const db = await getDb();
  await db.update(alerts).set({ emailedAt: new Date() }).where(eq(alerts.id, a.alertId));
};
