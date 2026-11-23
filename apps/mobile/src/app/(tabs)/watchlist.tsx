import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { GradeBadge } from '@/components/grade';
import { Icon } from '@/components/icon';
import { impactColor } from '@/components/report';
import { TabScreen } from '@/components/screen';
import { Body, Caption, EmptyState, ErrorState, PressableCard, PrimaryButton, Row, SkeletonList, TextButton } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo, timeUntil } from '@/lib/format';
import type { WatchItem } from '@/lib/types';
import { space, useTheme } from '@/theme';

export default function WatchlistScreen() {
  const { signedIn, user } = useAuth();
  const q = useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist, enabled: signedIn });
  const count = q.data?.items.length ?? 0;
  const atLimit = q.data && user?.plan === 'free' && count >= q.data.limit;

  if (!signedIn) {
    return (
      <TabScreen title="Watchlist">
        <EmptyState
          icon="eye"
          title="Know when the rules change"
          message="Watch the apps and sites you use. We re-read their policies and alert you the moment something changes against your rules."
          action={<PrimaryButton label="Create a free account" onPress={() => router.push('/sign-in')} />}
        />
      </TabScreen>
    );
  }

  return (
    <TabScreen
      title="Watchlist"
      subtitle={q.data ? `${count} of ${user?.plan === 'pro' ? 'unlimited' : q.data.limit} watched · long-press to remove` : undefined}
      right={atLimit ? <TextButton label="Go Pro" onPress={() => router.push('/upgrade')} /> : undefined}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}>
      {q.isPending && <SkeletonList />}
      {q.error && <ErrorState message={q.error.message} onRetry={() => q.refetch()} />}
      {q.data && count === 0 && (
        <EmptyState
          icon="bell"
          title="Nothing watched yet"
          message="Check a site or app, then tap “Watch for changes”. We'll do the reading from then on."
          action={<PrimaryButton label="Check something" onPress={() => router.navigate('/')} />}
        />
      )}
      <View style={{ gap: space.md }}>
        {q.data?.items.map((item) => (
          <WatchCard key={item.slug} item={item} />
        ))}
      </View>
    </TabScreen>
  );
}

function WatchCard({ item }: { item: WatchItem }) {
  const { c } = useTheme();
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.unwatch(item.slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const confirmRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Stop watching ${item.name}?`, "You won't get alerts when its policies change.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Stop watching', style: 'destructive', onPress: () => remove.mutate() },
    ]);
  };

  const next = timeUntil(item.nextCheckAt);
  return (
    <PressableCard
      onPress={() => router.push(`/s/${item.slug}`)}
      onLongPress={confirmRemove}
      accessibilityLabel={`${item.name}, grade ${item.grade ?? 'none'}`}
      accessibilityHint="Long-press to stop watching"
      style={{ gap: space.md, opacity: remove.isPending ? 0.4 : 1 }}>
      <Row>
        <GradeBadge grade={item.grade} size={44} />
        <View style={{ flex: 1 }}>
          <Body style={{ fontWeight: '700' }} numberOfLines={1}>
            {item.name}
          </Body>
          <Caption numberOfLines={1}>{item.domain ?? item.kind}</Caption>
        </View>
        <Icon name="chevronRight" size={14} color={c.faint} />
      </Row>
      {item.lastChange ? (
        <Row style={{ gap: space.sm, alignItems: 'flex-start' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: impactColor(c, item.lastChange.impact) }} />
          <Text style={{ flex: 1, color: c.ink, fontSize: 15 }}>
            {item.lastChange.headline} <Text style={{ color: c.muted }}>· {timeAgo(item.lastChange.at)}</Text>
          </Text>
        </Row>
      ) : (
        <Caption>No changes since you started watching.</Caption>
      )}
      <Row style={{ gap: 6 }}>
        <Icon name={item.hasError ? 'warning' : 'clock'} size={13} color={item.hasError ? c.warn : c.faint} />
        <Caption>
          {item.hasError ? "Couldn't read last time · " : ''}Checked {timeAgo(item.lastCheckedAt)}
          {next ? ` · next ${next}` : ''}
        </Caption>
      </Row>
    </PressableCard>
  );
}
