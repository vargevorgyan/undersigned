// Renders every app icon from the SVGs in brand/. Run: node scripts/brand-icons.mjs
import sharp from "sharp";

const out = [
  ["brand/mark.svg", "apps/extension/public/icon/16.png", 16],
  ["brand/mark.svg", "apps/extension/public/icon/32.png", 32],
  ["brand/mark.svg", "apps/extension/public/icon/48.png", 48],
  ["brand/mark.svg", "apps/extension/public/icon/128.png", 128],
  ["brand/mark-square.svg", "apps/web/src/app/apple-icon.png", 180],
  ["brand/mark-square.svg", "apps/mobile/assets/images/icon.png", 1024],
  ["brand/mark.svg", "apps/mobile/assets/images/favicon.png", 48],
  ["brand/glyph.svg", "apps/mobile/assets/images/splash-icon.png", 1024],
  ["brand/glyph.svg", "apps/mobile/assets/images/android-icon-foreground.png", 512],
  ["brand/glyph-mono.svg", "apps/mobile/assets/images/android-icon-monochrome.png", 432],
];
for (const [src, dest, size] of out) {
  await sharp(src, { density: Math.ceil((72 * size) / 64) * 2 }).resize(size, size).png().toFile(dest);
  console.log(`${dest} ${size}px`);
}
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#141518" } }).png().toFile("apps/mobile/assets/images/android-icon-background.png");
console.log("apps/mobile/assets/images/android-icon-background.png 512px");
