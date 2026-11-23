import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ApiError } from '@/lib/api';
import { AuthProvider, useAuth } from '@/lib/auth';
import { loadApiUrl } from '@/lib/config';
import { registerForPush } from '@/lib/push';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Client errors (401/404/402) won't fix themselves on retry.
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
    },
  },
});

/** Opens the service screen when the user taps a policy-change notification. */
function useNativeNotificationRouting() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const slug = response?.notification.request.content.data?.slug;
    if (typeof slug === 'string') router.push(`/s/${slug}`);
  }, [response]);
}

// Notification responses don't exist on web; Platform.OS is fixed at runtime, so the hook order stays stable.
const useNotificationRouting = Platform.OS === 'web' ? () => {} : useNativeNotificationRouting;

function Navigator() {
  const { c, dark } = useTheme();
  const { ready, signedIn } = useAuth();
  useNotificationRouting();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (signedIn) registerForPush();
  }, [signedIn]);

  const base = dark ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: c.bg, card: c.bg, primary: c.accent, text: c.ink, border: c.border } };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerTintColor: c.accent, headerTitleStyle: { color: c.ink }, headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="s/[slug]" options={{ title: '' }} />
        <Stack.Screen name="analyze" options={{ title: 'Checking', presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen
          name="sign-in"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: c.bg } }}
        />
        <Stack.Screen
          name="upgrade"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: c.bg } }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [configLoaded, setConfigLoaded] = useState(false);
  useEffect(() => {
    loadApiUrl().finally(() => setConfigLoaded(true));
  }, []);
  if (!configLoaded) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
