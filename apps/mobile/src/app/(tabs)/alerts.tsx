import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ServiceIcon } from '@/components/grade';
import { impactColor } from '@/components/report';
import { TabScreen } from '@/components/screen';
import { Caption, EmptyState, ErrorState, Muted, Pill, PrimaryButton, Row, SkeletonList, TextButton } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/format';
import type { AlertItem } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';

export default function AlertsScreen() {
  const { signedIn } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['alerts'], queryFn: api.alerts, enabled: signedIn });
  const markAll = useMutation({ mutationFn: () => api.markRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });

  if (!signedIn) {
    return (
      <TabScreen title="Alerts">
        <EmptyState
          icon="bell"
          title="Alerts land here"
          message="When a service you watch changes its policy — especially in a way that breaks your rules — you'll see it here and get a notification."
          action={<PrimaryButton label="Sign in" onPress={() => router.push('/sign-in')} />}
        />
      </TabScreen>
    );
  }

  const unread = q.data?.unread ?? 0;
  return (
    <TabScreen
      title="Alerts"
      subtitle={unread ? `${unread} unread` : undefined}
      right={unread > 0 ? <TextButton label="Mark all read" onPress={() => markAll.mutate()} /> : undefined}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}>
      {q.isPending && <SkeletonList />}
      {q.error && <ErrorState message={q.error.message} onRetry={() => q.refetch()} />}
      {q.data?.alerts.length === 0 && (
        <EmptyState icon="shield" title="All quiet" message="No policy changes yet. We check your watchlist regularly and will tell you right away." />
      )}
      <View style={{ gap: space.md }}>
        {q.data?.alerts.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </View>
    </TabScreen>
  );
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const { c } = useTheme();
  const qc = useQueryClient();
  const open = () => {
    if (!alert.read) api.markRead([alert.id]).then(() => qc.invalidateQueries({ queryKey: ['alerts'] }));
    router.push(`/s/${alert.slug}`);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${alert.read ? '' : 'Unread. '}${alert.title}`}
      onPress={open}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? c.cardPressed : c.card, borderColor: c.border }]}>
      <View style={[styles.stripe, { backgroundColor: impactColor(c, alert.impact) }]} />
      <View style={{ flex: 1, padding: space.lg, gap: space.sm }}>
        <Row>
          <ServiceIcon uri={alert.iconUrl} name={alert.serviceName} size={32} />
          <Caption style={{ flex: 1 }} numberOfLines={1}>
            {alert.serviceName} · {timeAgo(alert.createdAt)}
          </Caption>
          {!alert.read && <View style={[styles.unread, { backgroundColor: c.accent }]} />}
        </Row>
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: alert.read ? '600' : '800' }}>{alert.title}</Text>
        <Muted>{alert.body}</Muted>
        {alert.brokenRules.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {alert.brokenRules.map((r) => (
              <Pill key={r} label={`✗ ${r}`} color={c.danger} bg={c.dangerSoft} />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', borderCurve: 'continuous' },
  stripe: { width: 5 },
  unread: { width: 10, height: 10, borderRadius: 5 },
});
