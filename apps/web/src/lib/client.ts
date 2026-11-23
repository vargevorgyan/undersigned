"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: init.body ? { "content-type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong.", data.code);
  return data as T;
}

export type AnalyzeEvent = { type: "progress"; stage: string; message: string } | { type: "done"; slug: string } | { type: "error"; error: string };

/** POSTs to /analyze and yields SSE events as they arrive. */
export async function* analyzeStream(url: string): AsyncGenerator<AnalyzeEvent> {
  const res = await fetch("/api/v1/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    yield { type: "error", error: data.error ?? "Something went wrong. Please try again." };
    return;
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const event = frame.match(/^event: (.+)$/m)?.[1];
      const data = frame.match(/^data: (.+)$/m)?.[1];
      if (event && data) yield { type: event, ...JSON.parse(data) } as AnalyzeEvent;
    }
  }
}

export const RULES_COOKIE = "pr_rules";

/** Anonymous rule picks live in a cookie so server-rendered reports can use them. */
export function saveAnonRules(ids: string[]) {
  document.cookie = `${RULES_COOKIE}=${encodeURIComponent(ids.join(","))}; path=/; max-age=31536000; samesite=lax`;
}
