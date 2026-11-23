import { useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Icon } from '@/components/icon';
import { TabScreen } from '@/components/screen';
import { Body, Caption, Card, DestructiveButton, Divider, Heading, Muted, Pill, PrimaryButton, Row, Section, SecondaryButton, TextButton } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { defaultApiUrl, getApiUrl, saveApiUrl, webUrl } from '@/lib/config';
import type { Me } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';

export default function AccountScreen() {
  const { c } = useTheme();
  const qc = useQueryClient();
  const { signedIn, user, signOut, deleteAccount } = useAuth();

  const emailAlerts = useMutation({
    mutationFn: (on: boolean) => api.updateMe({ emailAlerts: on }),
    onMutate: (on) => qc.setQueryData<Me>(['me'], (old) => old && { ...old, user: { ...old.user, emailAlerts: on } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  const billing = useMutation({
    mutationFn: async (kind: 'checkout' | 'portal') => (kind === 'checkout' ? api.checkout() : api.portal()),
    onSuccess: async ({ url }) => {
      await WebBrowser.openBrowserAsync(url);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const confirmDelete = () =>
    Alert.alert('Delete your account?', 'Your watchlist, rules and alerts are permanently deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete forever',
        style: 'destructive',
        onPress: () => deleteAccount().catch((e: Error) => Alert.alert('Could not delete account', e.message)),
      },
    ]);

  return (
    <TabScreen title="Account">
      {signedIn && user ? (
        <>
          <Card style={{ gap: space.md }}>
            <Row>
              <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}>
                <Heading style={{ color: c.accent }}>{(user.name ?? user.email).charAt(0).toUpperCase()}</Heading>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Body style={{ fontWeight: '700' }} numberOfLines={1}>
                  {user.name ?? user.email}
                </Body>
                {user.plan === 'pro' ? <Pill label="PRO" color={c.accentInk} bg={c.accent} /> : <Pill label="FREE" color={c.muted} bg={c.cardPressed} />}
              </View>
            </Row>
            {user.plan === 'free' ? (
              <PrimaryButton label="Upgrade to Pro" icon="star" onPress={() => router.push('/upgrade')} />
            ) : (
              <SecondaryButton label="Manage subscription" onPress={() => billing.mutate('portal')} loading={billing.isPending} />
            )}
          </Card>

          <Section title="Notifications">
            <Card style={{ paddingVertical: space.xs }}>
              <Row style={{ paddingVertical: space.md, minHeight: 56 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Body style={{ fontWeight: '600' }}>Email alerts</Body>
                  <Caption>Get an email when a watched policy changes.</Caption>
                </View>
                <Switch value={user.emailAlerts} onValueChange={(v) => emailAlerts.mutate(v)} trackColor={{ true: c.accent, false: c.border }} accessibilityLabel="Email alerts" />
              </Row>
              <Divider />
              <Row style={{ paddingVertical: space.md, minHeight: 56 }}>
                <Icon name="bell" size={18} color={c.muted} />
                <Caption style={{ flex: 1 }}>Push alerts are on when you allow notifications for Undersigned in Settings.</Caption>
              </Row>
            </Card>
          </Section>
        </>
      ) : (
        <Card style={{ gap: space.md }}>
          <Heading>Your privacy, on watch</Heading>
          <Muted>A free account lets you watch services, write your own rules and get alerts when policies change.</Muted>
          <PrimaryButton label="Create a free account" onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'signup' } })} />
          <SecondaryButton label="I already have an account" onPress={() => router.push('/sign-in')} />
        </Card>
      )}

      <ServerSection />

      <Card style={{ gap: space.sm, backgroundColor: c.accentSoft, borderColor: 'transparent' }}>
        <Row style={{ gap: space.sm }}>
          <Icon name="lock" size={16} color={c.accent} />
          <Body style={{ fontWeight: '700', color: c.accent }}>We practice what we preach</Body>
        </Row>
        <Muted style={{ color: c.ink }}>
          We never sell data, show ads or track you. The app only sends the links you choose to check. Delete your account any time and everything goes with it.
        </Muted>
        <TextButton label="Read our privacy policy" onPress={() => WebBrowser.openBrowserAsync(webUrl('/privacy'))} />
      </Card>

      {signedIn && (
        <View style={{ gap: space.md }}>
          <SecondaryButton label="Sign out" onPress={signOut} />
          <DestructiveButton label="Delete account" onPress={confirmDelete} />
        </View>
      )}
      <Caption style={{ textAlign: 'center' }}>Undersigned {Constants.expoConfig?.version ?? ''}</Caption>
    </TabScreen>
  );
}

function ServerSection() {
  const { c } = useTheme();
  const qc = useQueryClient();
  const [value, setValue] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);
  const dirty = value.trim().replace(/\/+$/, '') !== getApiUrl();

  const save = async () => {
    setValue(await saveApiUrl(value));
    setSaved(true);
    qc.invalidateQueries();
  };

  return (
    <Section title="Server">
      <Card style={{ gap: space.md }}>
        <Caption>Where the app reaches Undersigned. Change this only for self-hosting or development.</Caption>
        <TextInput
          value={value}
          onChangeText={(t) => {
            setValue(t);
            setSaved(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder={defaultApiUrl()}
          placeholderTextColor={c.faint}
          accessibilityLabel="Server address"
          style={[styles.input, { color: c.ink, borderColor: c.border, backgroundColor: c.bg }]}
        />
        <Row style={{ justifyContent: 'space-between' }}>
          <TextButton label="Reset to default" onPress={() => setValue(defaultApiUrl())} color={c.muted} />
          {saved && !dirty ? <Caption style={{ color: c.success }}>Saved</Caption> : <TextButton label="Save" onPress={save} />}
        </Row>
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12, fontSize: 15 },
});
