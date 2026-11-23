import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Icon, type IconName } from '@/components/icon';
import { Body, Caption, Card, Heading, Muted, PrimaryButton, Row } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { webUrl } from '@/lib/config';
import { space, useTheme } from '@/theme';

const PERKS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'eye', title: 'Unlimited watchlist', text: 'Watch every app and site you use, not just 3.' },
  { icon: 'clock', title: 'Daily checks', text: 'Policies re-read every day instead of weekly.' },
  { icon: 'sparkles', title: '50 custom rules', text: 'Write rules in your own words; AI checks them all.' },
  { icon: 'bell', title: 'Instant alerts', text: 'Push and email the moment something changes.' },
];

export default function UpgradeSheet() {
  const { c } = useTheme();
  const qc = useQueryClient();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { signedIn, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    if (!signedIn) {
      router.replace({ pathname: '/sign-in', params: { mode: 'signup', reason: 'Create an account first, then upgrade to Pro.' } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.checkout().catch((e) => {
        // Billing not configured on this server: fall back to the web pricing page.
        if (e instanceof ApiError && e.status === 503) return { url: webUrl('/pricing') };
        throw e;
      });
      await WebBrowser.openBrowserAsync(url);
      await qc.invalidateQueries({ queryKey: ['me'] });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg }}>
      <View style={{ gap: space.sm }}>
        <Heading style={{ fontSize: 26 }}>{user?.plan === 'pro' ? "You're on Pro" : 'Go Pro'}</Heading>
        <Muted>{reason ?? 'Keep an eye on everything you use, for less than a coffee a month.'}</Muted>
      </View>
      <Card style={{ gap: space.lg }}>
        {PERKS.map((p) => (
          <Row key={p.title} style={{ alignItems: 'flex-start' }}>
            <Icon name={p.icon} size={20} color={c.accent} />
            <View style={{ flex: 1, gap: 2 }}>
              <Body style={{ fontWeight: '700' }}>{p.title}</Body>
              <Caption>{p.text}</Caption>
            </View>
          </Row>
        ))}
      </Card>
      {error && <Caption style={{ color: c.danger }}>{error}</Caption>}
      {user?.plan !== 'pro' && <PrimaryButton label="Upgrade · $4 / month" icon="star" onPress={upgrade} loading={busy} />}
      <Caption style={{ textAlign: 'center' }}>Cancel any time. Payments handled securely by Stripe.</Caption>
    </ScrollView>
  );
}
