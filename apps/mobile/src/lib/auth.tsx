import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, isUnauthorized } from './api';
import { getLocalPresets } from './local';
import { registerForPush } from './push';
import { getToken, setToken } from './storage';
import type { Limits, User } from './types';

type AuthState = {
  ready: boolean;
  signedIn: boolean;
  user: User | null;
  limits: Limits | null;
  billingEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then((t) => setHasToken(Boolean(t)));
  }, []);

  const me = useQuery({
    queryKey: ['me'],
    queryFn: api.me,
    enabled: hasToken === true,
    retry: (count, err) => !isUnauthorized(err) && count < 2,
  });

  // Expired or revoked token: drop it so the app falls back to anonymous mode.
  useEffect(() => {
    if (isUnauthorized(me.error)) {
      setToken(null);
      setHasToken(false);
    }
  }, [me.error]);

  const afterAuth = useCallback(
    async (token: string) => {
      await setToken(token);
      setHasToken(true);
      qc.clear();
      await qc.fetchQuery({ queryKey: ['me'], queryFn: api.me });
      registerForPush();
    },
    [qc],
  );

  const value = useMemo<AuthState>(
    () => ({
      ready: hasToken === false || (hasToken === true && !me.isPending),
      signedIn: Boolean(hasToken && me.data),
      user: me.data?.user ?? null,
      limits: me.data?.limits ?? null,
      billingEnabled: me.data?.billingEnabled ?? false,
      signIn: async (email, password) => afterAuth((await api.signIn({ email, password })).token),
      signUp: async (email, password, name) => afterAuth((await api.signUp({ email, password, name, presetIds: await getLocalPresets() })).token),
      signOut: async () => {
        await api.signOut().catch(() => {});
        await setToken(null);
        setHasToken(false);
        qc.clear();
      },
      deleteAccount: async () => {
        await api.deleteAccount();
        await setToken(null);
        setHasToken(false);
        qc.clear();
      },
    }),
    [hasToken, me.data, me.isPending, afterAuth, qc],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
