import * as Crypto from 'expo-crypto';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { activities, flashcards, materials, quizAttempts, quizQuestions, subjects } from '@/db/schema';

export type SubjectInput = {
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
};

export const subjectsRepo = {
  listQuery(userId: string) {
    return db
      .select()
      .from(subjects)
      .where(and(eq(subjects.userId, userId), isNull(subjects.deletedAt)))
      .orderBy(desc(subjects.createdAt));
  },

  async create(userId: string, input: SubjectInput): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date();
    await db.insert(subjects).values({ id, userId, createdAt: now, updatedAt: now, ...input });
    return id;
  },

  async update(id: string, input: SubjectInput): Promise<void> {
    await db.update(subjects).set({ ...input, updatedAt: new Date() }).where(eq(subjects.id, id));
  },

  /** Borrado lógico en cascada: la materia y todo lo generado a partir de ella. */
  async remove(id: string): Promise<void> {
    const now = new Date();
    const stamp = { deletedAt: now, updatedAt: now };
    await db.transaction(async (tx) => {
      const own = await tx.select({ id: materials.id }).from(materials).where(eq(materials.subjectId, id));
      for (const m of own) {
        await tx.update(quizQuestions).set(stamp).where(eq(quizQuestions.materialId, m.id));
        await tx.update(activities).set(stamp).where(eq(activities.materialId, m.id));
      }
      await tx.update(flashcards).set(stamp).where(eq(flashcards.subjectId, id));
      await tx.update(quizAttempts).set(stamp).where(eq(quizAttempts.subjectId, id));
      await tx.update(materials).set(stamp).where(eq(materials.subjectId, id));
      await tx.update(subjects).set(stamp).where(eq(subjects.id, id));
    });
  },
};
