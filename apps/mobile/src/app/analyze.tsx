import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/icon';
import { StepList } from '@/components/report';
import { Card, Heading, Muted, PrimaryButton, SecondaryButton } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { detectLink } from '@/lib/format';
import { addRecent, getLocalPresets } from '@/lib/local';
import { space, useTheme } from '@/theme';

const STEPS = ['Opening the link', 'Finding the policies', 'Reading the fine print', 'Analyzing with AI', 'Saving your report'];
// Seconds after which each step starts; the AI step holds until the server answers.
const STEP_AT = [0, 2, 5, 9];

/** Analysis progress screen; also the target of undersigned://analyze?url=… deep links. */
export default function AnalyzeScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { signedIn } = useAuth();
  const { url } = useLocalSearchParams<{ url?: string }>();
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);
  const link = detectLink(url);
  const linkUrl = link?.url;

  useEffect(() => {
    if (!linkUrl || started.current === attempt) return;
    started.current = attempt;
    let cancelled = false;
    setActive(0);
    setDone(false);
    setError(null);
    const timers = STEP_AT.map((sec, i) => setTimeout(() => setActive((a) => Math.max(a, i)), sec * 1000));

    (async () => {
      try {
        const { slug } = await api.analyze(linkUrl);
        const rules = signedIn ? undefined : await getLocalPresets();
        const view = await qc.fetchQuery({ queryKey: ['service', slug, rules?.join(',') ?? 'me'], queryFn: () => api.service(slug, rules) });
        await addRecent({ url: linkUrl, slug, name: view.service.name, grade: view.service.grade });
        if (cancelled) return;
        timers.forEach(clearTimeout);
        setDone(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => !cancelled && router.replace(`/s/${slug}`), 650);
      } catch (e) {
        if (cancelled) return;
        timers.forEach(clearTimeout);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
      }
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [linkUrl, attempt, qc, signedIn]);

  if (!link) {
    return (
      <Shell top={insets.top}>
        <Heading>That link doesn't look right</Heading>
        <Muted>Paste a website, a Google Play or App Store link, or a privacy policy URL.</Muted>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </Shell>
    );
  }

  return (
    <Shell top={insets.top}>
      <View style={{ gap: space.sm }}>
        <Muted>Checking</Muted>
        <Heading numberOfLines={2}>{link.label}</Heading>
      </View>
      {error ? (
        <Card style={{ gap: space.md, backgroundColor: c.dangerSoft, borderColor: 'transparent' }}>
          <Icon name="warning" size={26} color={c.danger} />
          <Muted style={{ color: c.ink }}>{error}</Muted>
          <PrimaryButton label="Try again" onPress={() => setAttempt((a) => a + 1)} />
          <SecondaryButton label="Edit the link" onPress={() => router.back()} />
        </Card>
      ) : (
        <>
          <Card style={{ paddingVertical: space.xl }}>
            <StepList steps={STEPS} active={active} done={done} />
          </Card>
          <Muted style={{ textAlign: 'center' }}>Long policies can take up to a minute. First-time checks are slowest — after that they're instant for everyone.</Muted>
          <SecondaryButton label="Cancel" onPress={() => router.back()} />
        </>
      )}
    </Shell>
  );
}

function Shell({ top, children }: { top: number; children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: top + space.xxl, paddingHorizontal: space.xl, gap: space.xl }}>{children}</View>;
}
