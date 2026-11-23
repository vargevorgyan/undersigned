import { useEffect, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { radius, space, useTheme } from '@/theme';
import { Icon, type IconName } from './icon';

// ---------- Text ----------

function makeText(style: TextStyle, tone: 'ink' | 'muted' | 'faint') {
  return function T({ style: extra, ...props }: TextProps) {
    const { c } = useTheme();
    return <Text {...props} style={[{ color: c[tone] }, style, extra]} />;
  };
}

export const Title = makeText({ fontSize: 30, fontWeight: '800', letterSpacing: -0.6 }, 'ink');
export const Heading = makeText({ fontSize: 20, fontWeight: '700', letterSpacing: -0.3 }, 'ink');
export const Subheading = makeText({ fontSize: 16, fontWeight: '600' }, 'ink');
export const Body = makeText({ fontSize: 16, lineHeight: 23 }, 'ink');
export const Muted = makeText({ fontSize: 15, lineHeight: 21 }, 'muted');
export const Caption = makeText({ fontSize: 13, lineHeight: 18 }, 'muted');
export const SectionLabel = makeText({ fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }, 'faint');

// ---------- Surfaces ----------

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>{children}</View>;
}

export function PressableCard({ children, style, ...props }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? c.cardPressed : c.card, borderColor: c.border }, style]}>
      {children}
    </Pressable>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.sectionHeader}>
        <SectionLabel>{title}</SectionLabel>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md }, style]}>{children}</View>;
}

export function Divider() {
  const { c } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border }} />;
}

// ---------- Buttons ----------

type ButtonProps = Omit<PressableProps, 'children'> & { label: string; loading?: boolean; icon?: IconName };

function ButtonBase({ label, loading, icon, disabled, bg, pressedBg, fg, border, ...props }: ButtonProps & { bg: string; pressedBg: string; fg: string; border?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: loading }}
      disabled={disabled || loading}
      {...props}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? pressedBg : bg, opacity: disabled ? 0.5 : 1, borderColor: border ?? 'transparent' },
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : icon && <Icon name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  const { c } = useTheme();
  return <ButtonBase {...props} bg={c.accent} pressedBg={c.accent + 'cc'} fg={c.accentInk} />;
}

export function SecondaryButton(props: ButtonProps) {
  const { c } = useTheme();
  return <ButtonBase {...props} bg={c.card} pressedBg={c.cardPressed} fg={c.ink} border={c.border} />;
}

export function DestructiveButton(props: ButtonProps) {
  const { c } = useTheme();
  return <ButtonBase {...props} bg={c.dangerSoft} pressedBg={c.dangerSoft + 'aa'} fg={c.danger} />;
}

export function TextButton({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, minHeight: 32, justifyContent: 'center' })}>
      <Text style={{ color: color ?? c.accent, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

// ---------- Chips & pills ----------

export function Chip({ label, onPress, icon }: { label: string; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.chip, { backgroundColor: pressed ? c.cardPressed : c.card, borderColor: c.border }]}>
      {icon && <Icon name={icon} size={15} color={c.accent} />}
      <Text style={{ color: c.ink, fontSize: 14, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ---------- States ----------

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: ViewStyle['width']; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[{ height, width, borderRadius: radius.sm, backgroundColor: c.skeleton, opacity }, style]} />;
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: space.md }} accessibilityLabel="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} style={{ gap: space.sm }}>
          <Skeleton height={18} width="55%" />
          <Skeleton height={14} width="85%" />
        </Card>
      ))}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { c } = useTheme();
  return (
    <Card style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
      <Icon name="wifiOff" size={30} color={c.muted} />
      <Muted style={{ textAlign: 'center' }}>{message}</Muted>
      {onRetry && <SecondaryButton label="Try again" onPress={onRetry} />}
    </Card>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.lg }}>
      <View style={[styles.emptyIcon, { backgroundColor: c.accentSoft }]}>
        <Icon name={icon} size={30} color={c.accent} />
      </View>
      <Heading style={{ textAlign: 'center' }}>{title}</Heading>
      <Muted style={{ textAlign: 'center', maxWidth: 320 }}>{message}</Muted>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, borderCurve: 'continuous' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xs },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
