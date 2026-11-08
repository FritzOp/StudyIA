import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useActivities, useFlashcards } from '@/hooks/useStudyData';
import { planReminder, type ReminderPlan } from '@/lib/progress';
import {
  cancelReminder,
  DEFAULT_SETTINGS,
  getPermission,
  loadSettings,
  remindersAvailable,
  requestPermission,
  saveSettings,
  scheduleReminder,
  type ReminderPermission,
  type ReminderSettings,
} from '@/services/reminders';

type RemindersContextType = {
  available: boolean;
  settings: ReminderSettings;
  permission: ReminderPermission | null;
  /** Próximo aviso programado, o null si no hay nada que avisar. */
  nextPlan: ReminderPlan | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  setHour: (hour: number) => void;
};

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

const RESCHEDULE_DELAY_MS = 1500;

/** Mantiene un solo aviso programado, recalculado con los datos reales de SQLite. */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const cards = useFlashcards();
  const activities = useActivities();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<ReminderPermission | null>(null);
  const [nextPlan, setNextPlan] = useState<ReminderPlan | null>(null);
  // Cambia al volver a la app: si pasó la hora del aviso, hay que calcular el siguiente.
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    loadSettings().then(setSettings);
    getPermission()
      .then(setPermission)
      .catch(() => setPermission('unavailable'));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setForegroundTick((n) => n + 1);
      getPermission()
        .then(setPermission)
        .catch(() => undefined);
    });
    return () => subscription.remove();
  }, []);

  // Se espera un momento para agrupar varios cambios seguidos (por ejemplo, un repaso).
  useEffect(() => {
    const active = settings.enabled && permission === 'granted';
    const timer = setTimeout(() => {
      if (!active) {
        setNextPlan(null);
        cancelReminder().catch(() => undefined);
        return;
      }
      const plan = planReminder({
        now: new Date(),
        hour: settings.hour,
        cards,
        activityDates: activities.map((a) => a.createdAt),
      });
      setNextPlan(plan);
      (plan ? scheduleReminder(plan) : cancelReminder()).catch(() => undefined);
    }, RESCHEDULE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settings, permission, cards, activities, foregroundTick]);

  // Al tocar el aviso se abre directamente el repaso.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!lastResponse) return;
    const route = lastResponse.notification.request.content.data?.route;
    Notifications.clearLastNotificationResponse();
    if (route === 'flashcards') router.push({ pathname: '/estudio/flashcards', params: { due: '1' } });
    else if (route === 'practica') router.navigate('/practica');
  }, [lastResponse]);

  const update = useCallback((next: ReminderSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const value = useMemo<RemindersContextType>(
    () => ({
      available: remindersAvailable,
      settings,
      permission,
      nextPlan,
      setEnabled: async (enabled) => {
        if (enabled) {
          // El interruptor nunca debe dejar un error sin manejar: si falla, queda apagado.
          const result = await requestPermission().catch(() => 'unavailable' as const);
          setPermission(result);
          if (result !== 'granted') return;
        }
        update({ ...settings, enabled });
      },
      setHour: (hour) => update({ ...settings, hour }),
    }),
    [settings, permission, nextPlan, update]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextType {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders debe usarse dentro de RemindersProvider');
  return ctx;
}
