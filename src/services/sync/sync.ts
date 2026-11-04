import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { db } from '@/db/client';
import { profilesRepo } from '@/db/repositories/profiles';
import {
  activities,
  flashcards,
  materials,
  profiles,
  quizAttempts,
  quizQuestions,
  subjects,
} from '@/db/schema';
import { supabase } from '@/lib/supabase';
import { fromRemote, remoteWins, toRemote, type Row, type SyncFields } from './mapping';

export type SyncResult = { uploaded: number; downloaded: number };

type TableSpec = SyncFields & {
  /** Tabla local; todas comparten las columnas de syncColumns(). */
  table: any;
  remote: string;
};

const PAGE_SIZE = 1000;
const PUSH_CHUNK = 200;

// El orden importa: padres antes que hijos, por las llaves foráneas de la nube.
const TABLES: TableSpec[] = [
  {
    table: subjects,
    remote: 'study_subjects',
    fields: { name: 'name', code: 'code', description: 'description', color: 'color', icon: 'icon' },
  },
  {
    table: materials,
    remote: 'study_materials',
    hasStatus: true,
    // fileUri no se sincroniza: es una ruta de este teléfono.
    fields: {
      subjectId: 'subject_id',
      title: 'title',
      sourceType: 'source_type',
      sourceText: 'source_text',
      fileName: 'file_name',
      mimeType: 'mime_type',
      status: 'status',
      generator: 'generator',
      errorMessage: 'error_message',
      summary: 'summary',
      keyConcepts: 'key_concepts',
    },
  },
  {
    table: flashcards,
    remote: 'study_flashcards',
    fields: {
      materialId: 'material_id',
      subjectId: 'subject_id',
      question: 'question',
      answer: 'answer',
      box: 'box',
      dueAt: 'due_at',
      reviewCount: 'review_count',
      lastReviewedAt: 'last_reviewed_at',
    },
    dates: ['dueAt', 'lastReviewedAt'],
  },
  {
    table: quizQuestions,
    remote: 'study_quiz_questions',
    fields: {
      materialId: 'material_id',
      question: 'question',
      options: 'options',
      correctIndex: 'correct_index',
      explanation: 'explanation',
      position: 'position',
    },
  },
  {
    table: quizAttempts,
    remote: 'study_quiz_attempts',
    fields: {
      materialId: 'material_id',
      subjectId: 'subject_id',
      score: 'score',
      total: 'total',
      answers: 'answers',
    },
  },
  {
    table: activities,
    remote: 'study_activities',
    fields: {
      type: 'type',
      title: 'title',
      detail: 'detail',
      subjectName: 'subject_name',
      materialId: 'material_id',
    },
  },
];

async function fetchAll(remote: string, userId: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(remote)
      .select('*')
      .eq('user_id', userId)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return rows;
  }
}

/** Bajar: inserta lo que no existe y aplica "gana el último cambio" a lo que ya existe. */
async function pull(spec: TableSpec, userId: string): Promise<number> {
  const table = spec.table;
  const remoteRows = await fetchAll(spec.remote, userId);
  if (remoteRows.length === 0) return 0;

  const localRows: Row[] = await db
    .select({ id: table.id, updatedAt: table.updatedAt })
    .from(table as SQLiteTable)
    .where(eq(table.userId, userId));
  const local = new Map<string, Date>(localRows.map((r) => [r.id, r.updatedAt]));

  let downloaded = 0;
  for (const remote of remoteRows) {
    const values = fromRemote(spec, remote);
    const localTime = local.get(values.id);
    if (!remoteWins(values.updatedAt, localTime)) continue;
    const row = { ...values, syncedAt: values.updatedAt };
    if (localTime === undefined) {
      await db.insert(table).values(row);
    } else {
      await db.update(table).set(row).where(eq(table.id, values.id));
    }
    downloaded += 1;
  }
  return downloaded;
}

function pendingFilter(table: any, userId: string) {
  return and(
    eq(table.userId, userId),
    or(isNull(table.syncedAt), lt(table.syncedAt, table.updatedAt))
  );
}

/** Subir: upsert por id de lo pendiente, y marca syncedAt = updatedAt que se subió. */
async function push(spec: TableSpec, userId: string): Promise<number> {
  const table = spec.table;
  const pending: Row[] = await db
    .select()
    .from(table as SQLiteTable)
    .where(pendingFilter(table, userId));

  for (let i = 0; i < pending.length; i += PUSH_CHUNK) {
    const chunk = pending.slice(i, i + PUSH_CHUNK);
    const { error } = await supabase
      .from(spec.remote)
      .upsert(
        chunk.map((row) => toRemote(spec, row, userId)),
        { onConflict: 'id' }
      );
    if (error) throw new Error(error.message);

    for (const row of chunk) {
      // Si cambió mientras se subía, updatedAt ya no coincide y sigue pendiente.
      await db
        .update(table)
        .set({ syncedAt: row.updatedAt })
        .where(and(eq(table.id, row.id), eq(table.updatedAt, row.updatedAt)));
    }
  }
  return pending.length;
}

async function syncProfile(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email, institution, career, semester, updated_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const local = await profilesRepo.get(userId);
  if (!local) return;

  if (data && remoteWins(new Date(data.updated_at), local.updatedAt)) {
    const updatedAt = new Date(data.updated_at);
    await db
      .update(profiles)
      .set({
        name: data.name,
        email: data.email,
        institution: data.institution ?? local.institution,
        career: data.career ?? local.career,
        semester: data.semester ?? local.semester,
        updatedAt,
        syncedAt: updatedAt,
      })
      .where(eq(profiles.id, userId));
    return;
  }
  if (local.syncedAt == null || local.syncedAt.getTime() < local.updatedAt.getTime()) {
    const { error: upError } = await supabase.from('profiles').upsert({
      id: userId,
      name: local.name,
      email: local.email,
      institution: local.institution,
      career: local.career,
      semester: local.semester,
      updated_at: local.updatedAt.toISOString(),
    });
    if (upError) throw new Error(upError.message);
    await db.update(profiles).set({ syncedAt: local.updatedAt }).where(eq(profiles.id, userId));
  }
}

let inFlight: Promise<SyncResult> | null = null;

/** Sincroniza todo: primero baja y luego sube. Si ya hay una en curso, reutiliza esa promesa. */
export function syncAll(userId: string): Promise<SyncResult> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    await syncProfile(userId);
    let downloaded = 0;
    let uploaded = 0;
    for (const spec of TABLES) downloaded += await pull(spec, userId);
    for (const spec of TABLES) uploaded += await push(spec, userId);
    return { uploaded, downloaded };
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export async function countPending(userId: string): Promise<number> {
  let total = 0;
  for (const spec of TABLES) {
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(spec.table as SQLiteTable)
      .where(pendingFilter(spec.table, userId));
    total += Number(rows[0]?.count ?? 0);
  }
  return total;
}
