import fs from "node:fs";
import type { NextConfig } from "next";

// Allow a single .env at the repo root.
if (fs.existsSync("../../.env")) process.loadEnvFile("../../.env");

const config: NextConfig = {
  transpilePackages: ["@privacy-radar/core"],
  serverExternalPackages: ["@electric-sql/pglite", "pg", "linkedom", "@mozilla/readability"],
  async headers() {
    // Bearer-token API used by the extension and mobile app; no cookies cross-origin, so * is safe.
    return [
      {
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, Accept" },
        ],
      },
    ];
  },
};

export default config;
