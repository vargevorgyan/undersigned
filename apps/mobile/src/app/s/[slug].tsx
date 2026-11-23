import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradeBadge, ServiceIcon } from '@/components/grade';
import { Icon } from '@/components/icon';
import { FactList, Highlights, History, Segmented, SummaryCard, VerdictCard } from '@/components/report';
import { Caption, Card, ErrorState, Heading, Muted, PrimaryButton, Row, SecondaryButton, Section, Skeleton } from '@/components/ui';
import { api, ApiError, isLimit, isUnauthorized } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { webUrl } from '@/lib/config';
import { plural, timeAgo } from '@/lib/format';
import { useLocalPresets } from '@/lib/local';
import { DOC_LABELS, KIND_LABELS, type ServiceView } from '@/lib/types';
import { GRADE_COLORS, GRADE_LABELS, radius, space, useTheme } from '@/theme';

export default function ServiceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { signedIn, ready } = useAuth();
  const [localPresets] = useLocalPresets();
  const rules = signedIn ? undefined : (localPresets ?? undefined);
  const key = ['service', slug, rules?.join(',') ?? 'me'];
  const q = useQuery({ queryKey: key, queryFn: () => api.service(slug, rules), enabled: ready && (signedIn || localPresets !== null) });
  const [docId, setDocId] = useState<string | null>(null);

  const share = () => {
    const name = q.data?.service.name ?? 'this service';
    Share.share({ message: `What ${name} does with your data: ${webUrl(`/s/${slug}`)}`, url: webUrl(`/s/${slug}`) });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: q.data?.service.name ?? '',
          headerRight: () => (
            <Pressable onPress={share} hitSlop={12} accessibilityRole="button" accessibilityLabel="Share report" style={{ padding: 4 }}>
              <Icon name="share" size={20} color={c.accent} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 120 + insets.bottom, gap: space.xl }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={c.accent} />}>
        {q.isPending && <ReportSkeleton />}
        {q.error && <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />}
        {q.data && <Report view={q.data} docId={docId} onDoc={setDocId} />}
      </ScrollView>
      {q.data && <WatchBar view={q.data} queryKey={key} />}
    </>
  );
}

function errorMessage(e: unknown) {
  if (e instanceof ApiError && e.status === 404) return "We haven't analyzed this service yet. Check its link from the Check tab.";
  return e instanceof Error ? e.message : 'Something went wrong.';
}

function Report({ view, docId, onDoc }: { view: ServiceView; docId: string | null; onDoc: (id: string) => void }) {
  const { c } = useTheme();
  const { service, verdict, documents, history } = view;
  const analyzed = documents.filter((d) => d.version);
  const doc = analyzed.find((d) => d.id === docId) ?? analyzed[0] ?? documents[0];
  const docHistory = history.filter((h) => !doc || h.documentId === doc.id);

  return (
    <>
      <View style={{ gap: space.lg }}>
        <Row>
          <ServiceIcon uri={service.iconUrl} name={service.name} size={48} />
          <View style={{ flex: 1, gap: 2 }}>
            <Heading numberOfLines={2}>{service.name}</Heading>
            <Caption>
              {KIND_LABELS[service.kind]}
              {service.domain ? ` · ${service.domain}` : ''}
            </Caption>
          </View>
        </Row>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <GradeBadge grade={service.grade} size={76} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: service.grade ? GRADE_COLORS[service.grade] : c.muted, fontSize: 22, fontWeight: '800' }}>
              {service.grade ? GRADE_LABELS[service.grade] : 'Not graded yet'}
            </Text>
            <Caption>
              Overall grade · worst of {plural(analyzed.length, 'document')}
              {view.watchers > 0 ? ` · ${plural(view.watchers, 'watcher')}` : ''}
            </Caption>
          </View>
        </Card>
      </View>

      <VerdictCard verdict={verdict} onEditRules={() => router.navigate('/rules')} />

      {analyzed.length > 1 && (
        <Segmented options={analyzed.map((d) => ({ value: d.id, label: DOC_LABELS[d.type] }))} value={doc!.id} onChange={onDoc} />
      )}

      {doc?.version ? (
        <>
          <SummaryCard analysis={doc.version.analysis} />
          {doc.version.engine === 'basic' && (
            <Card style={{ backgroundColor: c.warnSoft, borderColor: 'transparent' }}>
              <Muted style={{ color: c.ink }}>This is a basic keyword scan. Full AI analysis isn't enabled on this server.</Muted>
            </Card>
          )}
          <Section title="What matters">
            <Highlights items={doc.version.analysis.highlights} />
          </Section>
          <Section title="Key facts">
            <FactList analysis={doc.version.analysis} />
          </Section>
          <Pressable
            accessibilityRole="link"
            onPress={() => WebBrowser.openBrowserAsync(doc.url)}
            style={({ pressed }) => [styles.source, { borderColor: c.border, opacity: pressed ? 0.6 : 1 }]}>
            <Icon name="doc" size={18} color={c.muted} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '600' }} numberOfLines={1}>
                Read the original {DOC_LABELS[doc.type].toLowerCase()}
              </Text>
              <Caption>
                {doc.version.wordCount.toLocaleString()} words · checked {timeAgo(doc.lastCheckedAt)}
              </Caption>
            </View>
            <Icon name="external" size={16} color={c.faint} />
          </Pressable>
        </>
      ) : (
        <ErrorState message={doc?.lastError ?? "We couldn't read this document yet."} />
      )}

      <Section title="Change history">
        <History items={docHistory} />
      </Section>
    </>
  );
}

function WatchBar({ view, queryKey }: { view: ServiceView; queryKey: unknown[] }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { signedIn } = useAuth();
  const slug = view.service.slug;

  const m = useMutation({
    mutationFn: () => (view.isWatching ? api.unwatch(slug) : api.watch(slug)),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.setQueryData<ServiceView>(queryKey, (old) => old && { ...old, isWatching: !old.isWatching });
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (e) => {
      if (isUnauthorized(e)) router.push({ pathname: '/sign-in', params: { reason: `Sign in to watch ${view.service.name} for changes.` } });
      else if (isLimit(e)) router.push({ pathname: '/upgrade', params: { reason: (e as ApiError).message } });
    },
  });

  const onPress = () => {
    if (!signedIn) {
      router.push({ pathname: '/sign-in', params: { reason: `Create a free account to get alerts when ${view.service.name} changes its policies.` } });
      return;
    }
    m.mutate();
  };

  const showError = m.error && !isUnauthorized(m.error) && !isLimit(m.error);
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + space.md, backgroundColor: c.bg, borderTopColor: c.border }]}>
      {showError && <Caption style={{ color: c.danger, textAlign: 'center' }}>{(m.error as Error).message}</Caption>}
      {view.isWatching ? (
        <SecondaryButton label="Watching · tap to stop" icon="eye" onPress={onPress} loading={m.isPending} />
      ) : (
        <PrimaryButton label="Watch for changes" icon="bell" onPress={onPress} loading={m.isPending} />
      )}
    </View>
  );
}

function ReportSkeleton() {
  return (
    <View style={{ gap: space.lg }}>
      <Row>
        <Skeleton height={48} width={48} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton height={22} width="60%" />
          <Skeleton height={14} width="40%" />
        </View>
      </Row>
      <Skeleton height={110} style={{ borderRadius: radius.lg }} />
      <Skeleton height={200} style={{ borderRadius: radius.lg }} />
      <Skeleton height={120} style={{ borderRadius: radius.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  source: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, minHeight: 56 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: space.md, gap: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
});

