import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import type { Grade } from '@/lib/types';
import { GRADE_COLORS, GRADE_LABELS, useTheme } from '@/theme';

export function GradeBadge({ grade, size = 44 }: { grade: Grade | null; size?: number }) {
  const { c } = useTheme();
  const color = grade ? GRADE_COLORS[grade] : c.faint;
  return (
    <View
      accessibilityLabel={grade ? `Grade ${grade}, ${GRADE_LABELS[grade]}` : 'Not graded yet'}
      style={[styles.badge, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: color }]}>
      <Text style={{ color: '#fff', fontSize: size * 0.5, fontWeight: '800' }}>{grade ?? '–'}</Text>
    </View>
  );
}

export function ServiceIcon({ uri, name, size = 40 }: { uri: string | null; name: string; size?: number }) {
  const { c } = useTheme();
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.25, backgroundColor: c.cardPressed, borderColor: c.border }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size * 0.7, height: size * 0.7, borderRadius: size * 0.15 }} contentFit="contain" />
      ) : (
        <Text style={{ color: c.muted, fontSize: size * 0.42, fontWeight: '700' }}>{name.charAt(0).toUpperCase()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' },
  icon: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', borderCurve: 'continuous' },
});
