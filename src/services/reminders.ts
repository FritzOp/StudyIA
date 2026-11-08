import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import type { ReminderPlan } from '@/lib/progress';

// Notificaciones locales: no necesitan servidor ni token push, y funcionan sin conexión.

const STORAGE_KEY = 'studyia.reminders';
const CHANNEL_ID = 'recordatorios';
const REMINDER_ID = 'studyia-repaso';

export type ReminderSettings = { enabled: boolean; hour: number };
export const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, hour: 19 };
export const REMINDER_HOURS = [7, 12, 16, 19, 21];

export type ReminderPermission = 'granted' | 'denied' | 'blocked' | 'unavailable';

export const remindersAvailable = Platform.OS !== 'web';

if (remindersAvailable) {
  // Con la app abierta también se muestra el aviso.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function loadSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled === true,
      hour: REMINDER_HOURS.includes(parsed.hour ?? -1) ? (parsed.hour as number) : DEFAULT_SETTINGS.hour,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => undefined);
}

export async function getPermission(): Promise<ReminderPermission> {
  if (!remindersAvailable) return 'unavailable';
  const status = await Notifications.getPermissionsAsync();
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'denied' : 'blocked';
}

/**
 * Crea el canal propio (es idempotente). Devuelve false si no se pudo: en Expo Go para Android
 * la llamada nativa falla, y entonces el aviso usa el canal por defecto en lugar de perderse.
 */
async function ensureChannel(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de repaso',
      importance: AndroidImportance.HIGH,
    });
    return true;
  } catch (error) {
    console.warn('No se pudo crear el canal de recordatorios; se usará el canal por defecto.', error);
    return false;
  }
}

/** Pide permiso en contexto (al activar el recordatorio), no al abrir la app. */
export async function requestPermission(): Promise<ReminderPermission> {
  if (!remindersAvailable) return 'unavailable';
  const current = await getPermission();
  if (current !== 'denied') return current;
  // En Android 13+ el canal debe existir antes de pedir el permiso.
  await ensureChannel();
  const result = await Notifications.requestPermissionsAsync();
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'denied' : 'blocked';
}

export async function cancelReminder(): Promise<void> {
  if (!remindersAvailable) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
}

/** Reemplaza el aviso programado. Usa un id fijo para que nunca haya dos a la vez. */
export async function scheduleReminder(plan: ReminderPlan): Promise<void> {
  if (!remindersAvailable) return;
  await cancelReminder();
  const ownChannel = await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: plan.title,
      body: plan.body,
      data: { route: plan.dueCount > 0 ? 'flashcards' : 'practica' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: plan.date,
      ...(ownChannel ? { channelId: CHANNEL_ID } : {}),
    },
  });
}
