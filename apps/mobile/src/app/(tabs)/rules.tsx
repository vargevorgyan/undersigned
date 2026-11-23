import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Icon } from '@/components/icon';
import { TabScreen } from '@/components/screen';
import { Body, Caption, Card, Divider, ErrorState, Muted, PrimaryButton, Row, Section, SkeletonList, TextButton } from '@/components/ui';
import { api, isLimit } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLocalPresets } from '@/lib/local';
import type { CustomRule, RulesPayload } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';

export default function RulesScreen() {
  const { c } = useTheme();
  const qc = useQueryClient();
  const { signedIn, user } = useAuth();
  const [localIds, saveLocal] = useLocalPresets();
  const q = useQuery({ queryKey: ['rules', signedIn], queryFn: api.rules });
  const [draft, setDraft] = useState('');

  const save = useMutation({
    mutationFn: api.saveRules,
    onMutate: async (next) => {
      // Optimistic: toggles feel instant.
      const prev = qc.getQueryData<RulesPayload>(['rules', true]);
      if (prev) qc.setQueryData<RulesPayload>(['rules', true], { ...prev, presetIds: next.presetIds, customRules: next.customRules as CustomRule[] });
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['rules', true], ctx.prev);
      if (isLimit(e)) router.push({ pathname: '/upgrade', params: { reason: e.message } });
    },
    onSuccess: (data) => {
      qc.setQueryData(['rules', true], data);
      qc.invalidateQueries({ queryKey: ['service'] });
    },
  });

  const data = q.data;
  const presetIds = signedIn ? (data?.presetIds ?? []) : (localIds ?? []);
  const custom = data?.customRules ?? [];

  const toggle = (id: string, on: boolean) => {
    Haptics.selectionAsync();
    const next = on ? [...presetIds, id] : presetIds.filter((x) => x !== id);
    if (signedIn) save.mutate({ presetIds: next, customRules: custom });
    else saveLocal(next).then(() => qc.invalidateQueries({ queryKey: ['service'] }));
  };

  const addCustom = () => {
    const text = draft.trim();
    if (text.length < 3) return;
    setDraft('');
    save.mutate({ presetIds, customRules: [...custom, { text }] });
  };

  const removeCustom = (id: string) => save.mutate({ presetIds, customRules: custom.filter((r) => r.id !== id) });

  return (
    <TabScreen title="Your rules" subtitle="Tell us what you care about once. Every report is checked against these." refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {q.isPending && <SkeletonList count={5} />}
      {q.error && <ErrorState message={q.error.message} onRetry={() => q.refetch()} />}
      {data && (
        <>
          <Section title={`Quick rules · ${presetIds.length} on`}>
            <Card style={{ paddingVertical: space.xs }}>
              {data.presets.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider />}
                  <Row style={{ paddingVertical: space.md, minHeight: 56 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Body style={{ fontWeight: '600' }}>{p.label}</Body>
                      <Caption>{p.description}</Caption>
                    </View>
                    <Switch
                      value={presetIds.includes(p.id)}
                      onValueChange={(v) => toggle(p.id, v)}
                      trackColor={{ true: c.accent, false: c.border }}
                      accessibilityLabel={p.label}
                    />
                  </Row>
                </View>
              ))}
            </Card>
          </Section>

          <Section title={signedIn ? `Your own rules · ${custom.length} of ${data.limits.customRules}` : 'Your own rules'}>
            {signedIn ? (
              <Card style={{ gap: space.md }}>
                <Muted>Write any rule in plain words — our AI checks every policy against it.</Muted>
                {custom.map((r) => (
                  <Row key={r.id} style={[styles.customRow, { backgroundColor: c.bg }]}>
                    <Icon name="sparkles" size={16} color={c.accent} />
                    <Body style={{ flex: 1, fontSize: 15 }}>{r.text}</Body>
                    <Pressable onPress={() => removeCustom(r.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove rule ${r.text}`} style={{ padding: 6 }}>
                      <Icon name="trash" size={16} color={c.faint} />
                    </Pressable>
                  </Row>
                ))}
                <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.bg }]}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={addCustom}
                    placeholder='e.g. "Never share my health data"'
                    placeholderTextColor={c.faint}
                    returnKeyType="done"
                    maxLength={200}
                    style={{ flex: 1, color: c.ink, fontSize: 16, paddingVertical: 12 }}
                    accessibilityLabel="New custom rule"
                  />
                  <Pressable onPress={addCustom} disabled={draft.trim().length < 3} accessibilityRole="button" accessibilityLabel="Add rule" style={[styles.add, { backgroundColor: c.accent, opacity: draft.trim().length < 3 ? 0.4 : 1 }]}>
                    <Icon name="plus" size={18} color={c.accentInk} />
                  </Pressable>
                </View>
                {user?.plan === 'free' && custom.length >= data.limits.customRules && (
                  <TextButton label="Need more rules? Go Pro" onPress={() => router.push('/upgrade')} />
                )}
              </Card>
            ) : (
              <Card style={{ gap: space.md }}>
                <Muted>Sign in to write your own rules in plain words, like “Never share my health data”. Your quick rules above are saved on this device.</Muted>
                <PrimaryButton label="Create a free account" onPress={() => router.push('/sign-in')} />
              </Card>
            )}
          </Section>
          {save.error && !isLimit(save.error) && <Caption style={{ color: c.danger }}>{save.error.message}</Caption>}
        </>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  customRow: { padding: space.md, borderRadius: radius.md, gap: space.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingLeft: space.md, paddingRight: 6 },
  add: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
