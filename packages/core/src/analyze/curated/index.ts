import type { PolicyAnalysis } from "../schema";
import { SPOTIFY } from "./spotify";

/** Hand-reviewed analyses keyed by document URL. */
export const CURATED: Record<string, PolicyAnalysis> = { ...SPOTIFY };
