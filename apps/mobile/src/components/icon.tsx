import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, type ColorValue } from 'react-native';

type SymbolName = Exclude<SymbolViewProps['name'], string>;

const ICONS = {
  check: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  fail: { ios: 'xmark.circle.fill', android: 'cancel' },
  unclear: { ios: 'questionmark.circle.fill', android: 'help' },
  search: { ios: 'magnifyingglass', android: 'search' },
  eye: { ios: 'eye', android: 'visibility' },
  bell: { ios: 'bell', android: 'notifications' },
  sliders: { ios: 'slider.horizontal.3', android: 'tune' },
  person: { ios: 'person.crop.circle', android: 'account_circle' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more' },
  clipboard: { ios: 'doc.on.clipboard', android: 'content_paste' },
  clock: { ios: 'clock', android: 'schedule' },
  trash: { ios: 'trash', android: 'delete' },
  plus: { ios: 'plus', android: 'add' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  shield: { ios: 'checkmark.shield.fill', android: 'verified_user' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  better: { ios: 'arrow.up.right', android: 'trending_up' },
  worse: { ios: 'arrow.down.right', android: 'trending_down' },
  globe: { ios: 'globe', android: 'language' },
  phone: { ios: 'iphone', android: 'smartphone' },
  lock: { ios: 'lock.fill', android: 'lock' },
  doc: { ios: 'doc.text', android: 'description' },
  star: { ios: 'star.fill', android: 'star' },
  external: { ios: 'arrow.up.right.square', android: 'open_in_new' },
  wifiOff: { ios: 'wifi.slash', android: 'wifi_off' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

// Web has no system symbols; show a glyph instead.
const WEB_GLYPHS: Partial<Record<IconName, string>> = {
  check: '✓', fail: '✕', unclear: '?', search: '⌕', bell: '🔔', share: '↗', chevronRight: '›', chevronDown: '⌄',
  clipboard: '📋', clock: '🕒', trash: '🗑', plus: '+', sparkles: '✨', warning: '⚠', better: '↗', worse: '↘',
  lock: '🔒', star: '★', external: '↗', globe: '🌐', phone: '📱',
};

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  const fallback = <Text style={{ color, fontSize: size * 0.85, lineHeight: size, width: size, textAlign: 'center', fontWeight: '700' }}>{WEB_GLYPHS[name] ?? '•'}</Text>;
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} fallback={fallback} />;
}
