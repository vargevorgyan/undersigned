import { ImageResponse } from "next/og";
import { getServiceView } from "@privacy-radar/core";
import { GRADE_COLORS, gradeLabel } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const view = await getServiceView((await params).slug);
  const grade = view?.service.grade ?? "?";
  const name = view?.service.name ?? "Unknown service";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#fafaf8", color: "#141518", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34 }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#141518" />
      <path d="M22.5 8h19c0 5.5 5.5 10.5 5.5 18 0 7.5-6.5 16.5-15 31-8.5-14.5-15-23.5-15-31 0-7.5 5.5-12.5 5.5-18z" fill="#fafaf8" />
      <path d="M23.5 27.5c4.6-6.4 12.4-6.4 17 0-4.6 6.4-12.4 6.4-17 0z" fill="#141518" />
      <circle cx="32" cy="27.5" r="3.6" fill="#f0c04f" />
      <circle cx="32" cy="27.5" r="1.5" fill="#141518" />
      <circle cx="33.3" cy="26.2" r=".75" fill="#fafaf8" />
      <path d="M32 34.5v20" stroke="#141518" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Undersigned
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div style={{ width: 180, height: 180, borderRadius: 20, background: GRADE_COLORS[grade] ?? "#8a8d93", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, fontWeight: 600 }}>{grade}</div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -1.5 }}>{name}</div>
            <div style={{ fontSize: 36, color: GRADE_COLORS[grade] ?? "#5b5e64" }}>{`${gradeLabel(grade)} privacy policy and terms`}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#5b5e64", borderTop: "2px solid #e2e2dd", paddingTop: 28 }}>
          <span>Know what you sign.</span>
          <span>Every finding quotes the original</span>
        </div>
      </div>
    ),
    size,
  );
}
