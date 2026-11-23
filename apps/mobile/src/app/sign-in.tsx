import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Segmented } from '@/components/report';
import { Caption, Heading, Muted, PrimaryButton } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { radius, space, useTheme } from '@/theme';

type Mode = 'signin' | 'signup';

export default function SignInSheet() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ reason?: string; mode?: Mode }>();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(params.mode ?? (params.reason ? 'signup' : 'signin'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= (mode === 'signup' ? 8 : 1);

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') await signUp(email.trim(), password, name.trim() || undefined);
      else await signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [styles.input, { color: c.ink, borderColor: c.border, backgroundColor: c.card }];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.sm }}>
          <Heading style={{ fontSize: 26 }}>{mode === 'signup' ? 'Create your free account' : 'Welcome back'}</Heading>
          <Muted>{params.reason ?? 'Watch services, write your own rules and get alerts when policies change.'}</Muted>
        </View>
        <Segmented
          options={[
            { value: 'signup', label: 'Create account' },
            { value: 'signin', label: 'Sign in' },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
        />
        {mode === 'signup' && (
          <TextInput value={name} onChangeText={setName} placeholder="Name (optional)" placeholderTextColor={c.faint} textContentType="name" autoComplete="name" style={inputStyle} returnKeyType="next" accessibilityLabel="Name" />
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={c.faint}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          style={inputStyle}
          accessibilityLabel="Email"
        />
        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
          placeholderTextColor={c.faint}
          secureTextEntry
          textContentType={mode === 'signup' ? 'newPassword' : 'password'}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          returnKeyType="go"
          onSubmitEditing={submit}
          style={inputStyle}
          accessibilityLabel="Password"
        />
        {error && <Caption style={{ color: c.danger, fontSize: 14 }}>{error}</Caption>}
        <PrimaryButton label={mode === 'signup' ? 'Create account' : 'Sign in'} onPress={submit} loading={busy} disabled={!canSubmit} />
        <Caption style={{ textAlign: 'center' }}>Free forever for up to 3 watched services. No ads, no tracking, no data selling.</Caption>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: space.lg, minHeight: 52, fontSize: 16 },
});
