import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { profilesRepo } from '@/db/repositories/profiles';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { cancelReminder } from '@/services/reminders';

export const GUEST_USER_ID = 'local_guest';

const GUEST_KEY = 'studyia.guest';
const LAST_USER_KEY = 'studyia.lastUser';

type AuthResult = { error: string | null };
type CachedUser = { id: string; email: string };

type SignUpInput = { name: string; email: string; password: string; career: string };

type AuthContextType = {
  /** Sesión válida con Supabase. Puede ser null con cuenta iniciada si está sin conexión. */
  session: Session | null;
  /** Usuario actual: el de la sesión, el último conocido (sin conexión) o el invitado. */
  userId: string | null;
  email: string;
  isGuest: boolean;
  loading: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('already registered')) return 'Ese correo ya está registrado.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.';
  if (m.includes('password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.';
  if (m.includes('network') || m.includes('fetch')) return 'Sin conexión. Revisa tu internet.';
  return message;
}

const NOT_CONFIGURED: AuthResult = {
  error: 'La nube no está configurada en esta instalación. Puedes continuar sin cuenta.',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const [guest, rawUser] = await Promise.all([
        AsyncStorage.getItem(GUEST_KEY),
        AsyncStorage.getItem(LAST_USER_KEY),
      ]);
      if (!active) return;
      setIsGuest(guest === '1');
      // Sin red y con el token vencido getSession no devuelve sesión, pero la cuenta sigue
      // iniciada: la app debe abrir igual porque los datos viven en este teléfono.
      if (rawUser) setCachedUser(JSON.parse(rawUser) as CachedUser);

      const { data } = await supabase.auth.getSession();
      if (active) setSession(data.session);
    })()
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (next) {
        const user = { id: next.user.id, email: next.user.email ?? '' };
        AsyncStorage.setItem(LAST_USER_KEY, JSON.stringify(user)).catch(() => undefined);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => undefined);
        // El perfil se crea antes de entrar para que las pantallas ya lo encuentren en SQLite.
        profilesRepo
          .ensure(user.id, {
            email: user.email,
            name: next.user.user_metadata?.name,
            career: next.user.user_metadata?.career,
          })
          .catch(() => undefined)
          .finally(() => {
            setSession(next);
            setCachedUser(user);
            setIsGuest(false);
          });
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setCachedUser(null);
        AsyncStorage.removeItem(LAST_USER_KEY).catch(() => undefined);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const signedInId = session?.user.id ?? cachedUser?.id ?? null;
    return {
      session,
      userId: signedInId ?? (isGuest ? GUEST_USER_ID : null),
      email: session?.user.email ?? cachedUser?.email ?? '',
      isGuest: !signedInId && isGuest,
      loading,
      isSupabaseConfigured,

      signIn: async (email, password) => {
        if (!isSupabaseConfigured) return NOT_CONFIGURED;
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          return { error: error ? translateError(error.message) : null };
        } catch (e) {
          return { error: translateError(e instanceof Error ? e.message : 'network') };
        }
      },

      signUp: async ({ name, email, password, career }) => {
        if (!isSupabaseConfigured) return NOT_CONFIGURED;
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: { name, career, role: 'Estudiante Universitario', institution: 'Universidad de La Guajira' },
            },
          });
          if (error) return { error: translateError(error.message) };
          if (!data.session) {
            return { error: 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.' };
          }
          return { error: null };
        } catch (e) {
          return { error: translateError(e instanceof Error ? e.message : 'network') };
        }
      },

      resetPassword: async (email) => {
        if (!isSupabaseConfigured) return NOT_CONFIGURED;
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
          return { error: error ? translateError(error.message) : null };
        } catch (e) {
          return { error: translateError(e instanceof Error ? e.message : 'network') };
        }
      },

      continueAsGuest: () => {
        AsyncStorage.setItem(GUEST_KEY, '1').catch(() => undefined);
        profilesRepo
          .ensure(GUEST_USER_ID, { name: 'Invitado' })
          .catch(() => undefined)
          .finally(() => setIsGuest(true));
      },

      signOut: async () => {
        // El aviso programado es de esta cuenta: no debe sonar para la siguiente.
        await cancelReminder();
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => undefined);
        if (session) {
          // scope local: cerrar sesión debe funcionar también sin conexión.
          await supabase.auth.signOut({ scope: 'local' });
        }
        setSession(null);
        setCachedUser(null);
        AsyncStorage.removeItem(LAST_USER_KEY).catch(() => undefined);
      },
    };
  }, [session, cachedUser, isGuest, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

/** Para pantallas protegidas: ahí siempre hay usuario. */
export function useUserId(): string {
  const { userId } = useAuth();
  if (!userId) throw new Error('useUserId se usó sin un usuario activo');
  return userId;
}
