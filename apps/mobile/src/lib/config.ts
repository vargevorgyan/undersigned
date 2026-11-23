import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'pr_api_url';

/** Android emulators reach the host machine via 10.0.2.2, not localhost. */
function platformDefault() {
  const env = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
  if (Platform.OS === 'android') return env.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2');
  return env;
}

let current = platformDefault();

export const getApiUrl = () => current;
export const defaultApiUrl = platformDefault;

export async function loadApiUrl() {
  const saved = await AsyncStorage.getItem(KEY);
  if (saved) current = saved;
  return current;
}

export async function saveApiUrl(url: string) {
  const cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned || cleaned === platformDefault()) {
    current = platformDefault();
    await AsyncStorage.removeItem(KEY);
    return current;
  }
  current = /^https?:\/\//.test(cleaned) ? cleaned : `https://${cleaned}`;
  await AsyncStorage.setItem(KEY, current);
  return current;
}

/** Public web URL for a service report (same host as the API). */
export const webUrl = (path: string) => `${current}${path}`;
