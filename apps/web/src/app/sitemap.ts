import type { MetadataRoute } from "next";
import { listServices } from "@privacy-radar/core";
import { appUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const services = await listServices({ limit: 5000 }).catch(() => []);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/directory`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/pricing`, priority: 0.5 },
    { url: `${base}/download`, priority: 0.5 },
    ...services.map((s) => ({ url: `${base}/s/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
