import "server-only";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getDb, users } from "@privacy-radar/core/db";
import { appUrl, HttpError } from "./api";
import type { User } from "./auth";

let stripe: Stripe | null | undefined;
export function getStripe() {
  if (stripe === undefined) stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  return stripe;
}

export const billingEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

async function setPlan(where: { userId?: string; customerId?: string }, plan: "free" | "pro", customerId?: string) {
  const db = await getDb();
  const cond = where.userId ? eq(users.id, where.userId) : eq(users.stripeCustomerId, where.customerId!);
  await db.update(users).set({ plan, ...(customerId ? { stripeCustomerId: customerId } : {}) }).where(cond);
}

export async function createCheckout(user: User): Promise<string> {
  const s = getStripe();
  if (!s || !process.env.STRIPE_PRICE_ID) {
    // Local dev without Stripe: upgrade instantly so every flow is testable.
    if (process.env.NODE_ENV === "production") throw new HttpError(503, "Billing isn't configured yet.");
    await setPlan({ userId: user.id }, "pro");
    return `${appUrl()}/dashboard?upgraded=1`;
  }
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: user.id,
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
    allow_promotion_codes: true,
    success_url: `${appUrl()}/dashboard?upgraded=1`,
    cancel_url: `${appUrl()}/pricing`,
  });
  return session.url!;
}

export async function createPortal(user: User): Promise<string> {
  const s = getStripe();
  if (!s || !user.stripeCustomerId) {
    if (process.env.NODE_ENV === "production") throw new HttpError(400, "No subscription found.");
    await setPlan({ userId: user.id }, "free");
    return `${appUrl()}/settings?downgraded=1`;
  }
  const portal = await s.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: `${appUrl()}/settings` });
  return portal.url;
}

export async function handleWebhook(raw: string, signature: string | null) {
  const s = getStripe();
  if (!s || !process.env.STRIPE_WEBHOOK_SECRET || !signature) throw new HttpError(400, "Webhook not configured");
  const event = s.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET);
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.client_reference_id) await setPlan({ userId: session.client_reference_id }, "pro", String(session.customer));
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const active = event.type === "customer.subscription.updated" && ["active", "trialing", "past_due"].includes(sub.status);
      await setPlan({ customerId: String(sub.customer) }, active ? "pro" : "free");
      break;
    }
  }
}
