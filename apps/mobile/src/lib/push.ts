import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
  });
}

/** Best-effort push registration; silently skips simulators, Expo Go on Android and builds without an EAS projectId. */
export async function registerForPush(): Promise<string | null> {
  try {
    if (Platform.OS === 'web' || !Device.isDevice) return null;
    if (Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', { name: 'Policy alerts', importance: Notifications.AndroidImportance.HIGH });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.registerPushToken(data, Platform.OS);
    return data;
  } catch {
    return null;
  }
}
