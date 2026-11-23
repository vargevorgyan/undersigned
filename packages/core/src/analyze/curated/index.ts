import type { PolicyAnalysis } from "../schema";
import { DISCORD } from "./discord";
import { DUCKDUCKGO } from "./duckduckgo";
import { GOOGLE } from "./google";
import { LINKEDIN } from "./linkedin";
import { NETFLIX } from "./netflix";
import { SIGNAL } from "./signal";
import { SPOTIFY } from "./spotify";
import { TIKTOK } from "./tiktok";
import { X } from "./x";

/** Hand-reviewed analyses keyed by document URL. */
export const CURATED: Record<string, PolicyAnalysis> = {
  ...SPOTIFY,
  ...NETFLIX,
  ...TIKTOK,
  ...X,
  ...LINKEDIN,
  ...DISCORD,
  ...GOOGLE,
  ...SIGNAL,
  ...DUCKDUCKGO,
};
