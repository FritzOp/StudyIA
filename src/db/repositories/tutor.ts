import * as Crypto from 'expo-crypto';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tutorMessages, type TutorAttachment, type TutorMessage, type TutorRole } from '@/db/schema';
import { deleteLocalFile } from '@/services/files';

export const tutorRepo = {
  listQuery(userId: string, materialId: string) {
    return db
      .select()
      .from(tutorMessages)
      .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.materialId, materialId)))
      .orderBy(asc(tutorMessages.createdAt));
  },

  async add(
    userId: string,
    materialId: string,
    role: TutorRole,
    text: string,
    attachments: TutorAttachment[] = []
  ): Promise<TutorMessage> {
    const message: TutorMessage = {
      id: Crypto.randomUUID(),
      userId,
      materialId,
      role,
      text,
      attachments,
      createdAt: new Date(),
    };
    await db.insert(tutorMessages).values(message);
    return message;
  },

  /** Borra la conversación de un apunte y los archivos que se adjuntaron en ella. */
  async clear(userId: string, materialId: string): Promise<void> {
    const where = and(eq(tutorMessages.userId, userId), eq(tutorMessages.materialId, materialId));
    const rows = await db.select().from(tutorMessages).where(where);
    rows.flatMap((m) => m.attachments).forEach((a) => deleteLocalFile(a.uri));
    await db.delete(tutorMessages).where(where);
  },
};
