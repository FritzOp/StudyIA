import type { Activity, ActivityType, Flashcard, QuizAttempt } from '@/db/schema';
import { computeStreak, dayKey, isDue, percentage } from '@/lib/study';

// Lógica pura de recordatorios y gráficas de progreso (sin Expo) para probarla con Jest.

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export type DayActivity = {
  date: Date;
  /** Etiqueta corta para el eje: "lun", "mar"... u "hoy". */
  label: string;
  /** Etiqueta completa para el detalle: "miércoles 5 nov". */
  longLabel: string;
  total: number;
  byType: Record<ActivityType, number>;
};

/** Actividad de los últimos `days` días, del más antiguo a hoy. */
export function weeklyActivity(
  activities: Pick<Activity, 'createdAt' | 'type'>[],
  now: Date = new Date(),
  days = 7
): DayActivity[] {
  const result: DayActivity[] = [];
  const byKey = new Map<string, DayActivity>();
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const entry: DayActivity = {
      date,
      label: offset === 0 ? 'hoy' : WEEKDAYS[date.getDay()],
      longLabel: `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
      total: 0,
      byType: { material: 0, flashcards: 0, quiz: 0 },
    };
    result.push(entry);
    byKey.set(dayKey(date), entry);
  }
  for (const activity of activities) {
    const entry = byKey.get(dayKey(activity.createdAt));
    if (!entry) continue;
    entry.total += 1;
    entry.byType[activity.type] += 1;
  }
  return result;
}

export type QuizPoint = { date: Date; score: number; label: string; title: string };

/** Últimos intentos de quiz en orden cronológico, en porcentaje. */
export function quizTrend(
  attempts: Pick<QuizAttempt, 'createdAt' | 'score' | 'total' | 'materialId'>[],
  titleOf: (materialId: string) => string,
  limit = 10
): QuizPoint[] {
  return [...attempts]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-limit)
    .map((a) => ({
      date: a.createdAt,
      score: percentage(a.score, a.total),
      label: `${a.createdAt.getDate()} ${MONTHS[a.createdAt.getMonth()]}`,
      title: titleOf(a.materialId),
    }));
}

/** Próxima vez que toca el recordatorio: hoy a esa hora si aún no pasó, si no mañana. */
export function nextReminderDate(now: Date, hour: number, minute = 0): Date {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  if (today.getTime() > now.getTime()) return today;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute);
}

export type ReminderPlan = {
  date: Date;
  title: string;
  body: string;
  dueCount: number;
};

/**
 * Decide el próximo recordatorio. Avisa si habrá flashcards por repasar a esa hora; si no hay,
 * solo avisa para no perder la racha cuando ese día todavía no se ha estudiado.
 * Devuelve null si no hay nada útil que decir.
 */
export function planReminder(input: {
  now: Date;
  hour: number;
  minute?: number;
  cards: Pick<Flashcard, 'dueAt'>[];
  activityDates: Date[];
}): ReminderPlan | null {
  const date = nextReminderDate(input.now, input.hour, input.minute ?? 0);
  const dueCount = input.cards.filter((card) => isDue(card, date)).length;
  const streak = computeStreak(input.activityDates, date);
  const studiedThatDay = input.activityDates.some((d) => dayKey(d) === dayKey(date));

  if (dueCount > 0) {
    const cards = dueCount === 1 ? '1 flashcard te espera' : `${dueCount} flashcards te esperan`;
    const keep = streak > 0 && !studiedThatDay ? ` Mantén tu racha de ${streak} ${streak === 1 ? 'día' : 'días'}.` : '';
    return { date, dueCount, title: 'Hora de repasar', body: `${cards}.${keep}` };
  }
  if (streak > 0 && !studiedThatDay) {
    return {
      date,
      dueCount,
      title: 'No pierdas tu racha',
      body: `Llevas ${streak} ${streak === 1 ? 'día' : 'días'} seguidos. Haz un quiz o sube un apunte hoy.`,
    };
  }
  return null;
}

export function formatHour(hour: number, minute = 0): string {
  const suffix = hour < 12 ? 'a. m.' : 'p. m.';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** "hoy 7:00 p. m." o "mañana 7:00 a. m.". */
export function describeReminderDate(date: Date, now: Date = new Date()): string {
  const when = dayKey(date) === dayKey(now) ? 'hoy' : 'mañana';
  return `${when} ${formatHour(date.getHours(), date.getMinutes())}`;
}
