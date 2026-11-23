import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GradeBadge } from '@/components/grade';
import { Icon } from '@/components/icon';
import { TabScreen } from '@/components/screen';
import { Body, Caption, Card, Chip, Divider, PrimaryButton, Row, Section, TextButton } from '@/components/ui';
import { api } from '@/lib/api';
import { detectLink, timeAgo } from '@/lib/format';
import { clearRecent, useRecent } from '@/lib/local';
import { GRADE_LABELS, radius, space, useTheme } from '@/theme';

const EXAMPLES = [
  { label: 'TikTok', url: 'https://www.tiktok.com' },
  { label: 'WhatsApp · Android', url: 'https://play.google.com/store/apps/details?id=com.whatsapp' },
  { label: 'Instagram · iPhone', url: 'https://apps.apple.com/us/app/instagram/id389801252' },
  { label: 'Reddit', url: 'https://www.reddit.com' },
  { label: 'Spotify', url: 'https://www.spotify.com' },
];

function startCheck(url: string) {
  router.push({ pathname: '/analyze', params: { url } });
}

/** Suggests the clipboard's link without triggering iOS's paste prompt until the user taps. */
function useClipboardSuggestion() {
  const [suggestion, setSuggestion] = useState<{ url: string | null; label: string } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          if (Platform.OS === 'ios') {
            if (await Clipboard.hasUrlAsync()) !cancelled && setSuggestion({ url: null, label: 'the link you copied' });
            return;
          }
          const link = detectLink(await Clipboard.getStringAsync());
          if (!cancelled) setSuggestion(link);
        } catch {}
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );
  const accept = async () => {
    const url = suggestion?.url ?? detectLink(await Clipboard.getStringAsync())?.url;
    setSuggestion(null);
    if (url) startCheck(url);
  };
  return { suggestion, accept, dismiss: () => setSuggestion(null) };
}

export default function CheckScreen() {
  const { c } = useTheme();
  const [input, setInput] = useState('');
  const recent = useRecent();
  const clip = useClipboardSuggestion();
  const browse = useQuery({ queryKey: ['services'], queryFn: () => api.services() });
  const valid = detectLink(input);

  const submit = () => {
    if (!valid) return;
    setInput('');
    startCheck(valid.url);
  };

  return (
    <TabScreen title="Check" subtitle="Paste any website, app or policy link. We read the fine print so you don't have to.">
      <Card style={{ gap: space.md, padding: space.md }}>
        <View style={[styles.inputWrap, { backgroundColor: c.bg, borderColor: c.border }]}>
          <Icon name="search" size={18} color={c.faint} />
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={submit}
            placeholder="Paste a website, app or policy link"
            placeholderTextColor={c.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            clearButtonMode="while-editing"
            accessibilityLabel="Link to check"
            style={[styles.input, { color: c.ink }]}
          />
          {Platform.OS === 'ios' && Clipboard.isPasteButtonAvailable && input === '' && (
            <Clipboard.ClipboardPasteButton
              acceptedContentTypes={['url', 'plain-text']}
              displayMode="iconOnly"
              cornerStyle="capsule"
              backgroundColor={c.accentSoft}
              foregroundColor={c.accent}
              style={{ width: 40, height: 36 }}
              onPress={(data) => {
                const link = data.type === 'text' ? detectLink(data.text) : null;
                if (link) startCheck(link.url);
              }}
            />
          )}
        </View>
        <PrimaryButton label="Check it" icon="shield" onPress={submit} disabled={!valid} />
      </Card>

      {clip.suggestion && (
        <Pressable
          accessibilityRole="button"
          onPress={clip.accept}
          style={({ pressed }) => [styles.clip, { backgroundColor: pressed ? c.accentSoft + 'aa' : c.accentSoft }]}>
          <Icon name="clipboard" size={20} color={c.accent} />
          <Text style={{ flex: 1, color: c.accent, fontSize: 15, fontWeight: '600' }}>Check {clip.suggestion.label} from your clipboard?</Text>
          <TextButton label="Not now" onPress={clip.dismiss} color={c.muted} />
        </Pressable>
      )}

      <Section title="Try one">
        <View style={styles.chips}>
          {EXAMPLES.map((e) => (
            <Chip key={e.url} label={e.label} onPress={() => startCheck(e.url)} />
          ))}
        </View>
      </Section>

      {recent.length > 0 && (
        <Section title="Your recent checks" right={<TextButton label="Clear" onPress={clearRecent} color={c.muted} />}>
          <Card style={{ paddingVertical: space.xs }}>
            {recent.map((r, i) => (
              <View key={r.slug}>
                {i > 0 && <Divider />}
                <ServiceRow slug={r.slug} name={r.name} grade={r.grade} meta={`Checked ${timeAgo(r.at)}`} />
              </View>
            ))}
          </Card>
        </Section>
      )}

      {(browse.data?.services.length ?? 0) > 0 && (
        <Section title="Recently analyzed">
          <Card style={{ paddingVertical: space.xs }}>
            {browse.data!.services.slice(0, 8).map((s, i) => (
              <View key={s.slug}>
                {i > 0 && <Divider />}
                <ServiceRow slug={s.slug} name={s.name} grade={s.grade} meta={s.domain ?? s.kind} />
              </View>
            ))}
          </Card>
        </Section>
      )}

      <Row style={{ justifyContent: 'center', gap: space.sm }}>
        <Icon name="lock" size={13} color={c.faint} />
        <Caption>We only receive the links you check — never your browsing.</Caption>
      </Row>
    </TabScreen>
  );
}

function ServiceRow({ slug, name, grade, meta }: { slug: string; name: string; grade: Parameters<typeof GradeBadge>[0]['grade']; meta: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${grade ? `grade ${grade}` : 'not graded'}`}
      onPress={() => router.push(`/s/${slug}`)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <GradeBadge grade={grade} size={36} />
      <View style={{ flex: 1 }}>
        <Body style={{ fontWeight: '600' }} numberOfLines={1}>
          {name}
        </Body>
        <Caption numberOfLines={1}>{grade ? `${GRADE_LABELS[grade]} · ${meta}` : meta}</Caption>
      </View>
      <Icon name="chevronRight" size={14} color={c.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, paddingLeft: space.md, paddingRight: 6, minHeight: 54 },
  input: { flex: 1, fontSize: 17, paddingVertical: 14 },
  clip: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: 56 },
});
