import * as Crypto from 'expo-crypto';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  activities,
  flashcards,
  quizAttempts,
  quizQuestions,
  type ActivityType,
  type Flashcard,
} from '@/db/schema';
import { nextReview } from '@/lib/study';

export const studyRepo = {
  flashcardsQuery(userId: string) {
    return db
      .select()
      .from(flashcards)
      .where(and(eq(flashcards.userId, userId), isNull(flashcards.deletedAt)))
      .orderBy(asc(flashcards.dueAt));
  },

  questionsQuery(materialId: string) {
    return db
      .select()
      .from(quizQuestions)
      .where(and(eq(quizQuestions.materialId, materialId), isNull(quizQuestions.deletedAt)))
      .orderBy(asc(quizQuestions.position));
  },

  attemptsQuery(userId: string) {
    return db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), isNull(quizAttempts.deletedAt)))
      .orderBy(desc(quizAttempts.createdAt));
  },

  activitiesQuery(userId: string) {
    return db
      .select()
      .from(activities)
      .where(and(eq(activities.userId, userId), isNull(activities.deletedAt)))
      .orderBy(desc(activities.createdAt));
  },

  async reviewFlashcard(card: Flashcard, knew: boolean): Promise<void> {
    const now = new Date();
    const { box, dueAt } = nextReview(card.box, knew, now);
    await db
      .update(flashcards)
      .set({ box, dueAt, reviewCount: card.reviewCount + 1, lastReviewedAt: now, updatedAt: now })
      .where(eq(flashcards.id, card.id));
  },

  async saveAttempt(input: {
    userId: string;
    materialId: string;
    subjectId: string;
    score: number;
    total: number;
    answers: number[];
  }): Promise<void> {
    const now = new Date();
    await db.insert(quizAttempts).values({
      ...input,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  },

  async logActivity(input: {
    userId: string;
    type: ActivityType;
    title: string;
    detail: string;
    subjectName: string;
    materialId?: string | null;
  }): Promise<void> {
    const now = new Date();
    await db.insert(activities).values({
      ...input,
      materialId: input.materialId ?? null,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  },
};
