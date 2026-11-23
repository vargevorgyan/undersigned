import { useColorScheme } from 'react-native';

const light = {
  bg: '#fafaf8',
  card: '#ffffff',
  cardPressed: '#f1f1ee',
  ink: '#141518',
  muted: '#5b5e64',
  faint: '#8f9298',
  border: '#e2e2dd',
  accent: '#141518',
  accentInk: '#ffffff',
  accentSoft: '#f9e6ae',
  danger: '#c8372d',
  dangerSoft: '#fef2f2',
  success: '#1f8f4e',
  successSoft: '#f0fdf4',
  warn: '#a86f00',
  warnSoft: '#fffbeb',
  skeleton: '#ecece8',
};

export type Palette = typeof light;

const dark: Palette = {
  bg: '#0f1012',
  card: '#16171a',
  cardPressed: '#1f2024',
  ink: '#ececea',
  muted: '#9b9ea5',
  faint: '#6d7076',
  border: '#2c2e33',
  accent: '#ececea',
  accentInk: '#141518',
  accentSoft: '#4a3d19',
  danger: '#f87171',
  dangerSoft: '#3b1218',
  success: '#4ade80',
  successSoft: '#0f2a1a',
  warn: '#fbbf24',
  warnSoft: '#33240b',
  skeleton: '#1f2024',
};

export function useTheme() {
  const scheme = useColorScheme();
  return { c: scheme === 'dark' ? dark : light, dark: scheme === 'dark' };
}

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const GRADE_COLORS: Record<string, string> = {
  A: '#1f8f4e',
  B: '#5e9a1f',
  C: '#b98500',
  D: '#d4601c',
  E: '#c8372d',
};

export const GRADE_LABELS: Record<string, string> = {
  A: 'Respects you',
  B: 'Mostly fair',
  C: 'Mixed',
  D: 'Invasive',
  E: 'Very invasive',
};
