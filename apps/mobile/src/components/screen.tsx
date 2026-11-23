import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space, useTheme } from '@/theme';
import { Muted, Title } from './ui';

/** Tab screen shell: large title, safe areas, optional pull-to-refresh. */
export function TabScreen({
  title,
  subtitle,
  right,
  refreshing,
  onRefresh,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl * 3, gap: space.xl }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={c.accent} /> : undefined}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
          <Title accessibilityRole="header">{title}</Title>
          {right}
        </View>
        {subtitle && <Muted>{subtitle}</Muted>}
      </View>
      {children}
    </ScrollView>
  );
}
