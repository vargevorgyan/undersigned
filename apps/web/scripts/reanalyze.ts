import "./env";
import { reanalyzeStored } from "@privacy-radar/core";

// Usage: npm run reanalyze [-- basic|ai]
const only = process.argv[2] as "basic" | "ai" | undefined;
console.log(`Re-analyzed ${await reanalyzeStored({ onlyEngine: only })} documents.`);
process.exit(0);
