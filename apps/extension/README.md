# Undersigned browser extension

WXT + React, Manifest V3 for Chrome and Firefox. Talks to the web app's API (`docs/API.md`). The default server is `http://localhost:3000` and you can change it in Settings.

## Dev
```bash
cd apps/extension
npm install          # runs `wxt prepare`
npm run dev          # Chrome with hot reload (npm run dev:firefox for Firefox)
```
Start the web app first (`npm run dev` at the repo root).

## Build and load unpacked
```bash
npm run build            # .output/chrome-mv3
npm run build:firefox    # .output/firefox-mv3
```
- **Chrome:** go to `chrome://extensions`, turn on Developer mode, click "Load unpacked" and pick `.output/chrome-mv3`.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on" and pick `.output/firefox-mv3/manifest.json`.

## Publish
```bash
npm run zip   # .output/privacy-radar-<v>-chrome.zip, -firefox.zip and -sources.zip (for AMO review)
```
Upload the Chrome zip to the Chrome Web Store dashboard. Upload the Firefox zip and the sources zip to addons.mozilla.org. Before publishing, set the production API origin in `wxt.config.ts` (`host_permissions`) and in `DEFAULT_API_BASE` (`lib/store.ts`).

## Privacy design
- No content scripts and no host access to the sites you visit.
- Badges come from `/catalog`, a domain-to-grade list cached every 12h and matched on your device. Visited URLs never leave the browser.
- When you click "Analyze", the extension uses `activeTab` and runs a one-off script to collect privacy/terms links. Only the chosen policy URL is sent.
- Signed-in users get alerts polled every 3h, shown as browser notifications.

Icons: `npm run icons` regenerates `public/icon/*.png`, using no dependencies.
