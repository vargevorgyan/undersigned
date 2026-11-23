import { useQuery } from '@tanstack/react-query';
import { NativeTabs } from 'expo-router/native-tabs';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { c } = useTheme();
  const { signedIn } = useAuth();
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: api.alerts, enabled: signedIn, refetchInterval: 60_000 });
  const unread = signedIn ? (alerts.data?.unread ?? 0) : 0;

  return (
    <NativeTabs tintColor={c.accent} backgroundColor={c.bg} badgeBackgroundColor={c.danger}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Check</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="watchlist">
        <NativeTabs.Trigger.Label>Watchlist</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'eye', selected: 'eye.fill' }} md="visibility" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="alerts">
        <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bell', selected: 'bell.fill' }} md="notifications" />
        {unread > 0 && <NativeTabs.Trigger.Badge>{String(Math.min(unread, 99))}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rules">
        <NativeTabs.Trigger.Label>Rules</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
