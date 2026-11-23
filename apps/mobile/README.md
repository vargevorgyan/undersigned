# Undersigned — mobile (Expo)

Standalone Expo app (own `node_modules`, not part of the root npm workspaces). Talks to the web app's API (`docs/API.md`).

## Run

```bash
cd apps/mobile
npm install
EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:3000 npx expo start
```

- Scan the QR code with **Expo Go**. A phone can't reach `localhost`, so use your machine's LAN IP. The iOS simulator can use `http://localhost:3000`. The Android emulator maps `localhost` to `10.0.2.2` automatically.
- The server address can also be changed in the app: **Account → Server**.

## Structure

- `src/app/(tabs)`: Check, Watchlist, Alerts, Rules, Account (native tabs)
- `src/app/s/[slug].tsx`: service report. `src/app/analyze.tsx`: analysis progress. `sign-in` and `upgrade` are form sheets.
- `src/lib`: API client, auth (token in SecureStore), local state (recent checks, anonymous rules), push
- `src/components`: small primitives (`ui.tsx`), report building blocks (`report.tsx`), grade badge

## Deep links

- `undersigned://analyze?url=<encoded url>`: starts a check
- `undersigned://s/<slug>`: opens a report

## Share sheet

"Share → Undersigned" from the Play Store, App Store or Safari needs a **development build** with [`expo-share-intent`](https://github.com/achorein/expo-share-intent). It isn't included, so the app keeps working in Expo Go. Until then, the Check tab detects copied links automatically: the iOS paste button doesn't trigger a permission prompt, and Android reads the clipboard on focus.

## Push notifications

1. `npx eas-cli@latest init`: writes `extra.eas.projectId` into `app.json` (required for Expo push tokens).
2. Build a dev or production build (`npx eas-cli build --profile development`). Remote push doesn't work in Expo Go on Android, and the app skips registration there.
3. After sign-in, the app asks for permission and registers its Expo push token via `POST /push-tokens`. The server sends alerts through Expo's push service, and tapping one opens the report.

## Build & release

```bash
npx eas-cli build --platform all       # store builds
npx eas-cli submit --platform ios      # App Store Connect
npx eas-cli update                     # OTA JS updates
```

Bundle IDs: `app.undersigned` (iOS and Android). Set `EXPO_PUBLIC_API_URL` to the production API in the EAS build profile.

## Checks

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform ios
```
