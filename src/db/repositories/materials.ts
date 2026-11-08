import * as Crypto from 'expo-crypto';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  activities,
  flashcards,
  materials,
  quizAttempts,
  quizQuestions,
  type Material,
  type MaterialGenerator,
  type MaterialSource,
} from '@/db/schema';
import type { StudyGuide, StudyPack } from '@/services/ai/types';

export type MaterialInput = {
  subjectId: string;
  title: string;
  sourceType: MaterialSource;
  sourceText?: string | null;
  fileUri?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
};

export const materialsRepo = {
  listQuery(userId: string) {
    return db
      .select()
      .from(materials)
      .where(and(eq(materials.userId, userId), isNull(materials.deletedAt)))
      .orderBy(desc(materials.createdAt));
  },

  async getById(id: string): Promise<Material | undefined> {
    const rows = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    return rows[0];
  },

  async create(userId: string, input: MaterialInput): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date();
    await db.insert(materials).values({
      id,
      userId,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      subjectId: input.subjectId,
      title: input.title,
      sourceType: input.sourceType,
      sourceText: input.sourceText ?? null,
      fileUri: input.fileUri ?? null,
      fileName: input.fileName ?? null,
      mimeType: input.mimeType ?? null,
    });
    return id;
  },

  async setStatus(id: string, status: Material['status'], errorMessage: string | null = null) {
    await db
      .update(materials)
      .set({ status, errorMessage, updatedAt: new Date() })
      .where(eq(materials.id, id));
  },

  /** Lista lo que falta por procesar (al volver la conexión o al abrir la app). */
  async listUnprocessed(userId: string): Promise<Material[]> {
    return db
      .select()
      .from(materials)
      .where(
        and(
          eq(materials.userId, userId),
          isNull(materials.deletedAt),
          inArray(materials.status, ['pending', 'processing'])
        )
      );
  },

  /** Guarda el resultado de la IA y reemplaza (borrado lógico) lo generado antes. */
  async saveStudyPack(material: Material, pack: StudyPack, generator: MaterialGenerator): Promise<void> {
    const now = new Date();
    const base = { userId: material.userId, createdAt: now, updatedAt: now };
    const stamp = { deletedAt: now, updatedAt: now };
    await db.transaction(async (tx) => {
      await tx
        .update(flashcards)
        .set(stamp)
        .where(and(eq(flashcards.materialId, material.id), isNull(flashcards.deletedAt)));
      await tx
        .update(quizQuestions)
        .set(stamp)
        .where(and(eq(quizQuestions.materialId, material.id), isNull(quizQuestions.deletedAt)));

      if (pack.flashcards.length > 0) {
        await tx.insert(flashcards).values(
          pack.flashcards.map((card) => ({
            ...base,
            id: Crypto.randomUUID(),
            materialId: material.id,
            subjectId: material.subjectId,
            question: card.question,
            answer: card.answer,
            dueAt: now,
          }))
        );
      }
      if (pack.quiz.length > 0) {
        await tx.insert(quizQuestions).values(
          pack.quiz.map((q, position) => ({
            ...base,
            id: Crypto.randomUUID(),
            materialId: material.id,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            position,
          }))
        );
      }
      await tx
        .update(materials)
        .set({
          status: 'ready',
          errorMessage: null,
          generator,
          summary: pack.summary,
          keyConcepts: pack.keyConcepts,
          guide: pack.guide ?? null,
          updatedAt: now,
        })
        .where(eq(materials.id, material.id));
    });
  },

  async saveGuide(id: string, guide: StudyGuide): Promise<void> {
    await db.update(materials).set({ guide, updatedAt: new Date() }).where(eq(materials.id, id));
  },

  async remove(id: string): Promise<void> {
    const now = new Date();
    const stamp = { deletedAt: now, updatedAt: now };
    await db.transaction(async (tx) => {
      await tx.update(flashcards).set(stamp).where(eq(flashcards.materialId, id));
      await tx.update(quizQuestions).set(stamp).where(eq(quizQuestions.materialId, id));
      await tx.update(quizAttempts).set(stamp).where(eq(quizAttempts.materialId, id));
      await tx.update(activities).set(stamp).where(eq(activities.materialId, id));
      await tx.update(materials).set(stamp).where(eq(materials.id, id));
    });
  },
};
