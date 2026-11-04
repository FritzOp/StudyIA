import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { secureStorage } from '@/lib/secureStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = url.startsWith('https://') && publishableKey.length > 20;

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  publishableKey || 'placeholder-publishable-key',
  {
    auth: {
      // SecureStore no existe en web: allí se usa el localStorage por defecto.
      storage: Platform.OS === 'web' ? undefined : secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// En móvil el refresco del token solo debe correr con la app en primer plano.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
