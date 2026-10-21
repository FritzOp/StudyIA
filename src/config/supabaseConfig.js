/**
 * Configuración de Conexión a Supabase para StudyIA
 * 
 * Puedes configurar tus credenciales de dos formas:
 * 
 * OPCIÓN 1 (Recomendada con variables de entorno Expo):
 * Crea un archivo `.env` en la raíz del proyecto con:
 *   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica
 * 
 * OPCIÓN 2 (Directa en este archivo):
 * Pega tus valores directamente en los strings de abajo si prefieres no usar .env
 */

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://TU_PROYECTO.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

/**
 * Verifica si las credenciales de Supabase han sido configuradas
 */
export function isSupabaseConfigured() {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;

  return (
    url &&
    !url.includes('TU_PROYECTO') &&
    url.startsWith('https://') &&
    key &&
    !key.includes('TU_SUPABASE_ANON_KEY') &&
    key.length > 20
  );
}
