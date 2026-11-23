import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3,
  zip: {
    artifactTemplate: "privacy-radar-{{version}}-{{browser}}.zip",
    sourcesTemplate: "privacy-radar-{{version}}-sources.zip",
  },
  manifest: ({ browser }) => ({
    name: "Undersigned",
    description: "See how websites treat your data. Grades, your personal rules, and alerts when policies change.",
    permissions: ["storage", "tabs", "alarms", "notifications", "activeTab", "scripting"],
    // Only the API origin; no access to the sites you browse.
    host_permissions: ["http://localhost/*", "https://undersigned.app/*"],
    action: { default_title: "Undersigned" },
    ...(browser === "firefox" ? { browser_specific_settings: { gecko: { id: "extension@undersigned.app", strict_min_version: "115.0" } } } : {}),
  }),
});
