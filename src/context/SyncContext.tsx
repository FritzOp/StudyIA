import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { useNetworkState } from 'expo-network';
import { eq } from 'drizzle-orm';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { subjects } from '@/db/schema';
import { processPending } from '@/services/ai/pipeline';
import { describeSync } from '@/services/sync/mapping';
import { countPending, syncAll } from '@/services/sync/sync';

type SyncContextType = {
  isOnline: boolean;
  /** Hay conexión y sesión real: se puede llamar a la IA y a la nube. */
  canUseCloud: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastMessage: string | null;
  lastError: string | null;
  lastSyncedAt: Date | null;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const AUTO_SYNC_DELAY_MS = 4000;
const FOREGROUND_THROTTLE_MS = 60_000;
const RETRY_BASE_MS = 30_000;
const RETRY_MAX_MS = 5 * 60_000;
const QUEUE_RETRY_MS = 5 * 60_000;

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  const m = message.toLowerCase();
  if (m.includes('network') || m.includes('fetch')) return 'Sin conexión con la nube.';
  if (m.includes('could not find the table') || m.includes('does not exist')) {
    return 'La nube aún no tiene las tablas: falta aplicar las migraciones de Supabase.';
  }
  return message;
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { session, userId, isGuest } = useAuth();
  const network = useNetworkState();
  const isOnline = network.isInternetReachable ?? network.isConnected ?? false;
  const canUseCloud = isOnline && !!session;

  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [failures, setFailures] = useState(0);
  const lastRun = useRef(0);

  const refreshPending = useCallback(() => {
    const count = !userId || isGuest ? Promise.resolve(0) : countPending(userId);
    count
      .then(setPendingCount)
      .catch(() => undefined);
  }, [userId, isGuest]);

  // El contador se recalcula con cualquier cambio en SQLite (agrupando ráfagas).
  useEffect(() => {
    refreshPending();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = addDatabaseChangeListener(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(refreshPending, 300);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, [refreshPending]);

  const processQueue = useCallback(async () => {
    if (!userId) return;
    const rows = await db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(eq(subjects.userId, userId));
    const names = new Map(rows.map((r) => [r.id, r.name]));
    await processPending(userId, canUseCloud, (id) => names.get(id) ?? 'Sin materia');
  }, [userId, canUseCloud]);

  const syncNow = useCallback(async () => {
    if (!userId || isGuest || !session || !isOnline) return;
    lastRun.current = Date.now();
    setIsSyncing(true);
    setLastError(null);
    try {
      const result = await syncAll(userId);
      setLastMessage(describeSync(result));
      setLastSyncedAt(new Date());
      setFailures(0);
    } catch (error) {
      setLastError(friendlyError(error));
      setFailures((n) => n + 1);
    } finally {
      setIsSyncing(false);
      refreshPending();
    }
  }, [userId, isGuest, session, isOnline, refreshPending]);

  // Al abrir, al iniciar sesión o al recuperar la conexión: procesa lo pendiente y sincroniza.
  useEffect(() => {
    if (!userId) return;
    processQueue()
      .catch(() => undefined)
      .finally(() => {
        if (canUseCloud) syncNow();
      });
  }, [userId, canUseCloud, processQueue, syncNow]);

  // Lo que quedó pendiente porque la IA no respondió se vuelve a intentar mientras la app está abierta.
  useEffect(() => {
    if (!canUseCloud) return;
    const timer = setInterval(() => {
      processQueue().catch(() => undefined);
    }, QUEUE_RETRY_MS);
    return () => clearInterval(timer);
  }, [canUseCloud, processQueue]);

  // Respaldo automático poco después de cada cambio local.
  useEffect(() => {
    if (pendingCount === 0 || !canUseCloud || isSyncing) return;
    const timer = setTimeout(syncNow, AUTO_SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pendingCount, canUseCloud, isSyncing, syncNow]);

  // Si falló, reintenta solo con esperas crecientes (30 s, 1 min, 2 min... hasta 5 min).
  useEffect(() => {
    if (failures === 0 || !canUseCloud || isSyncing) return;
    const delay = Math.min(RETRY_BASE_MS * 2 ** (failures - 1), RETRY_MAX_MS);
    const timer = setTimeout(syncNow, delay);
    return () => clearTimeout(timer);
  }, [failures, canUseCloud, isSyncing, syncNow]);

  // Al volver a primer plano, a lo sumo una vez por minuto.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !canUseCloud) return;
      if (Date.now() - lastRun.current < FOREGROUND_THROTTLE_MS) return;
      processQueue().catch(() => undefined);
      syncNow();
    });
    return () => subscription.remove();
  }, [canUseCloud, processQueue, syncNow]);

  const value = useMemo(
    () => ({
      isOnline,
      canUseCloud,
      isSyncing,
      pendingCount,
      lastMessage,
      lastError,
      lastSyncedAt,
    }),
    [isOnline, canUseCloud, isSyncing, pendingCount, lastMessage, lastError, lastSyncedAt]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextType {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync debe usarse dentro de SyncProvider');
  return ctx;
}
