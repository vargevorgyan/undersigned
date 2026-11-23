import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/api";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/settings"] }], sitemap: `${appUrl()}/sitemap.xml` };
}
