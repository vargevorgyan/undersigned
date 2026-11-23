import fs from "node:fs";
import path from "node:path";

// Scripts share the web app's env files.
for (const f of [".env.local", ".env", "../../.env"]) {
  const p = path.resolve(process.cwd(), f);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}
