import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import type { AnalysisEngine, ChangeSummary, CustomRuleCheck, PolicyAnalysis } from "../analyze/schema";
import type { CustomRule } from "../rules";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  plan: text("plan").$type<"free" | "pro">().notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    client: text("client").$type<"web" | "extension" | "mobile">().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const services = pgTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain"),
  kind: text("kind").$type<"website" | "android" | "ios">().notNull().default("website"),
  storeId: text("store_id"),
  iconUrl: text("icon_url"),
  /** Latest overall grade, denormalized for listing pages. */
  grade: text("grade").$type<PolicyAnalysis["grade"]>(),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: id(),
    serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
    url: text("url").notNull().unique(),
    type: text("type").$type<PolicyAnalysis["documentType"]>().notNull(),
    title: text("title"),
    currentVersionId: text("current_version_id"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    nextCheckAt: timestamp("next_check_at", { withTimezone: true }).notNull().defaultNow(),
    lastError: text("last_error"),
    failures: integer("failures").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("documents_service_idx").on(t.serviceId), index("documents_next_check_idx").on(t.nextCheckAt)],
);

export const documentVersions = pgTable(
  "document_versions",
  {
    id: id(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    previousVersionId: text("previous_version_id"),
    contentHash: text("content_hash").notNull(),
    text: text("text").notNull(),
    analysis: jsonb("analysis").$type<PolicyAnalysis>().notNull(),
    engine: text("engine").$type<AnalysisEngine>().notNull(),
    change: jsonb("change").$type<ChangeSummary>(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("versions_document_idx").on(t.documentId)],
);

export const userRules = pgTable("user_rules", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  presetIds: jsonb("preset_ids").$type<string[]>().notNull(),
  customRules: jsonb("custom_rules").$type<CustomRule[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customRuleChecks = pgTable(
  "custom_rule_checks",
  {
    versionId: text("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
    rulesHash: text("rules_hash").notNull(),
    results: jsonb("results").$type<CustomRuleCheck["results"]>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.versionId, t.rulesHash] })],
);

export const watchlist = pgTable(
  "watchlist",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.serviceId] }), index("watchlist_service_idx").on(t.serviceId)],
);

export const alerts = pgTable(
  "alerts",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
    versionId: text("version_id").references(() => documentVersions.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    impact: text("impact").$type<ChangeSummary["impact"]>().notNull(),
    /** Rules that newly fail because of this change. */
    brokenRules: jsonb("broken_rules").$type<string[]>().notNull().default([]),
    readAt: timestamp("read_at", { withTimezone: true }),
    emailedAt: timestamp("emailed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("alerts_user_idx").on(t.userId, t.createdAt)],
);

export const pushTokens = pgTable("push_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  createdAt: createdAt(),
});

export const waitlist = pgTable("waitlist", {
  email: text("email").primaryKey(),
  source: text("source"),
  createdAt: createdAt(),
});
