import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { StudyGuide } from '../services/ai/types';

// Este archivo lo lee drizzle-kit con Node: no debe importar paquetes de Expo.

/**
 * Columnas comunes de las tablas sincronizadas.
 * - id: UUID generado en el teléfono; es el mismo en SQLite y en Supabase.
 * - syncedAt: versión (updatedAt) que quedó en la nube. Pendiente = vacío o anterior a updatedAt.
 * - deletedAt: borrado lógico, para que el borrado también llegue a la nube y a otros dispositivos.
 */
const syncColumns = () => ({
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});

export const subjects = sqliteTable(
  'subjects',
  {
    ...syncColumns(),
    name: text('name').notNull(),
    code: text('code').notNull().default(''),
    description: text('description').notNull().default(''),
    color: text('color').notNull().default('#6366F1'),
    icon: text('icon').notNull().default('book-open-page-variant'),
  },
  (t) => [index('subjects_user_idx').on(t.userId)]
);

export type MaterialStatus = 'pending' | 'processing' | 'ready' | 'error';
export type MaterialSource = 'text' | 'image' | 'pdf' | 'document';
export type MaterialGenerator = 'ai' | 'local';

export const materials = sqliteTable(
  'materials',
  {
    ...syncColumns(),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id),
    title: text('title').notNull(),
    sourceType: text('source_type').$type<MaterialSource>().notNull(),
    sourceText: text('source_text'),
    /** Ruta del archivo en este teléfono (la foto va al sistema de archivos; no se sincroniza). */
    fileUri: text('file_uri'),
    fileName: text('file_name'),
    mimeType: text('mime_type'),
    status: text('status').$type<MaterialStatus>().notNull().default('pending'),
    generator: text('generator').$type<MaterialGenerator>(),
    errorMessage: text('error_message'),
    summary: text('summary'),
    keyConcepts: text('key_concepts', { mode: 'json' }).$type<string[]>(),
    /** Guía de estudio de la IA (explicación, glosario, plan...). Vacía si se generó sin IA. */
    guide: text('guide', { mode: 'json' }).$type<StudyGuide>(),
  },
  (t) => [index('materials_user_idx').on(t.userId), index('materials_subject_idx').on(t.subjectId)]
);

export const flashcards = sqliteTable(
  'flashcards',
  {
    ...syncColumns(),
    materialId: text('material_id')
      .notNull()
      .references(() => materials.id),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    /** Caja de Leitner (1 a 5): mientras más alta, más espaciado el repaso. */
    box: integer('box').notNull().default(1),
    dueAt: integer('due_at', { mode: 'timestamp_ms' }).notNull(),
    reviewCount: integer('review_count').notNull().default(0),
    lastReviewedAt: integer('last_reviewed_at', { mode: 'timestamp_ms' }),
  },
  (t) => [index('flashcards_user_idx').on(t.userId), index('flashcards_material_idx').on(t.materialId)]
);

export const quizQuestions = sqliteTable(
  'quiz_questions',
  {
    ...syncColumns(),
    materialId: text('material_id')
      .notNull()
      .references(() => materials.id),
    question: text('question').notNull(),
    options: text('options', { mode: 'json' }).$type<string[]>().notNull(),
    correctIndex: integer('correct_index').notNull(),
    explanation: text('explanation').notNull().default(''),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('quiz_questions_material_idx').on(t.materialId)]
);

export const quizAttempts = sqliteTable(
  'quiz_attempts',
  {
    ...syncColumns(),
    materialId: text('material_id')
      .notNull()
      .references(() => materials.id),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id),
    score: integer('score').notNull(),
    total: integer('total').notNull(),
    answers: text('answers', { mode: 'json' }).$type<number[]>().notNull(),
  },
  (t) => [index('quiz_attempts_user_idx').on(t.userId), index('quiz_attempts_subject_idx').on(t.subjectId)]
);

export type ActivityType = 'material' | 'flashcards' | 'quiz';

/** Historial de estudio: alimenta "Actividad reciente" y el cálculo de la racha. */
export const activities = sqliteTable(
  'activities',
  {
    ...syncColumns(),
    type: text('type').$type<ActivityType>().notNull(),
    title: text('title').notNull(),
    detail: text('detail').notNull().default(''),
    subjectName: text('subject_name').notNull().default(''),
    materialId: text('material_id'),
  },
  (t) => [index('activities_user_idx').on(t.userId)]
);

export type TutorRole = 'user' | 'assistant';
export type TutorAttachment = { uri: string; mimeType: string; name: string };

/**
 * Conversación con el tutor de cada apunte. Es local (no se sincroniza): los adjuntos son
 * archivos de este teléfono. Se envía como historial para que StudyIA recuerde lo hablado.
 */
export const tutorMessages = sqliteTable(
  'tutor_messages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    materialId: text('material_id').notNull(),
    role: text('role').$type<TutorRole>().notNull(),
    text: text('text').notNull().default(''),
    attachments: text('attachments', { mode: 'json' }).$type<TutorAttachment[]>().notNull().default([]),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [index('tutor_messages_material_idx').on(t.userId, t.materialId)]
);

/** Perfil del estudiante. Un registro por usuario; id = userId. */
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().default(''),
  institution: text('institution').notNull().default('Universidad de La Guajira'),
  /** Carrera principal: define el color de la app y el enfoque de la IA. */
  career: text('career').notNull().default('Ingeniería de Sistemas'),
  /** Otras carreras del estudiante (doble programa, cambio de carrera...). */
  extraCareers: text('extra_careers', { mode: 'json' }).$type<string[]>().notNull().default([]),
  /** Si es verdadero, la app y la IA combinan todas las carreras; si no, solo la principal. */
  mixCareers: integer('mix_careers', { mode: 'boolean' }).notNull().default(false),
  semester: text('semester').notNull().default('1er Semestre'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }),
});

export type Subject = typeof subjects.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type TutorMessage = typeof tutorMessages.$inferSelect;
