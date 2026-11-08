import type { Activity, Flashcard, Material, QuizAttempt, Subject } from '@/db/schema';

// Lógica pura de estudio (sin base de datos ni Expo) para poder probarla con Jest.

const DAY_MS = 24 * 60 * 60 * 1000;

/** Una fila está pendiente si nunca se subió o se modificó después de la última subida. */
export function isPending(row: { syncedAt: Date | null; updatedAt: Date }): boolean {
  return row.syncedAt == null || row.syncedAt.getTime() < row.updatedAt.getTime();
}

/** Días de espera por caja de Leitner (índice = caja). */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
export const MAX_BOX = 5;
export const MASTERED_BOX = 4;

/** Sistema Leitner: si la sabía sube de caja; si no, vuelve a la caja 1 y se repasa mañana. */
export function nextReview(box: number, knew: boolean, now: Date = new Date()) {
  const nextBox = knew ? Math.min(box + 1, MAX_BOX) : 1;
  return { box: nextBox, dueAt: new Date(now.getTime() + BOX_INTERVAL_DAYS[nextBox] * DAY_MS) };
}

export function isDue(card: Pick<Flashcard, 'dueAt'>, now: Date = new Date()): boolean {
  return card.dueAt.getTime() <= now.getTime();
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Racha: días consecutivos con actividad terminando hoy o ayer
 * (si aún no has estudiado hoy, la racha de ayer sigue viva).
 */
export function computeStreak(dates: Date[], now: Date = new Date()): number {
  const days = new Set(dates.map(dayKey));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function percentage(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function averageScore(attempts: Pick<QuizAttempt, 'score' | 'total'>[]): number {
  if (attempts.length === 0) return 0;
  const sum = attempts.reduce((acc, a) => acc + percentage(a.score, a.total), 0);
  return Math.round(sum / attempts.length);
}

/**
 * Comprensión de una materia: promedia el dominio de flashcards y el puntaje de quizzes.
 * Se cuentan solo cuando ya se practicaron: tener tarjetas sin repasar no es 0 % de dominio
 * si el estudiante ya sacó buena nota en el quiz.
 */
export function comprehension(
  cards: Pick<Flashcard, 'box' | 'reviewCount'>[],
  attempts: Pick<QuizAttempt, 'score' | 'total'>[]
): number {
  const parts: number[] = [];
  if (cards.some((c) => c.reviewCount > 0)) {
    // Cada caja cuenta: una tarjeta aporta 0 % en la caja 1 y 100 % al llegar a la de dominio.
    const mastery = cards.reduce((sum, c) => sum + Math.min(1, (c.box - 1) / (MASTERED_BOX - 1)), 0);
    parts.push((mastery / cards.length) * 100);
  }
  if (attempts.length > 0) parts.push(averageScore(attempts));
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export type SubjectStats = {
  subject: Subject;
  materials: number;
  cards: number;
  due: number;
  attempts: number;
  progress: number;
};

export function subjectStats(
  subject: Subject,
  materials: Material[],
  cards: Flashcard[],
  attempts: QuizAttempt[],
  now: Date = new Date()
): SubjectStats {
  const ownCards = cards.filter((c) => c.subjectId === subject.id);
  const ownAttempts = attempts.filter((a) => a.subjectId === subject.id);
  return {
    subject,
    materials: materials.filter((m) => m.subjectId === subject.id).length,
    cards: ownCards.length,
    due: ownCards.filter((c) => isDue(c, now)).length,
    attempts: ownAttempts.length,
    progress: comprehension(ownCards, ownAttempts),
  };
}

export type OverallStats = {
  materials: number;
  summaries: number;
  cards: number;
  mastered: number;
  due: number;
  quizzes: number;
  average: number;
  streak: number;
  progress: number;
};

export function overallStats(
  materials: Material[],
  cards: Flashcard[],
  attempts: QuizAttempt[],
  activities: Pick<Activity, 'createdAt'>[],
  now: Date = new Date()
): OverallStats {
  return {
    materials: materials.length,
    summaries: materials.filter((m) => m.status === 'ready').length,
    cards: cards.length,
    mastered: cards.filter((c) => c.box >= MASTERED_BOX).length,
    due: cards.filter((c) => isDue(c, now)).length,
    quizzes: attempts.length,
    average: averageScore(attempts),
    streak: computeStreak(
      activities.map((a) => a.createdAt),
      now
    ),
    progress: comprehension(cards, attempts),
  };
}

export function timeAgo(date: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? 'E') + (parts[1]?.[0] ?? '')).toUpperCase();
}
