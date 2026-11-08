import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { profiles, type Profile } from '@/db/schema';

export type ProfileInput = Pick<Profile, 'name' | 'institution' | 'career' | 'semester'>;

export const profilesRepo = {
  query(userId: string) {
    return db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  },

  async get(userId: string): Promise<Profile | undefined> {
    const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    return rows[0];
  },

  /** Crea el perfil local si aún no existe (primer ingreso en este teléfono). */
  async ensure(userId: string, defaults: Partial<ProfileInput> & { email?: string }): Promise<void> {
    await db
      .insert(profiles)
      .values({
        id: userId,
        name: defaults.name || 'Estudiante',
        email: defaults.email ?? '',
        institution: defaults.institution || 'Universidad de La Guajira',
        career: defaults.career || 'Ingeniería de Sistemas',
        semester: defaults.semester || '1er Semestre',
        // Fecha antigua: si la nube ya tiene un perfil de este usuario, debe ganar.
        updatedAt: new Date(0),
      })
      .onConflictDoNothing();
  },

  /** La primera carrera de la lista es la principal; las demás son adicionales. */
  async setCareers(userId: string, careers: string[], mixCareers: boolean): Promise<void> {
    if (careers.length === 0) return;
    await db
      .update(profiles)
      .set({ career: careers[0], extraCareers: careers.slice(1), mixCareers, updatedAt: new Date() })
      .where(eq(profiles.id, userId));
  },

  async setSemester(userId: string, semester: string): Promise<void> {
    await db.update(profiles).set({ semester, updatedAt: new Date() }).where(eq(profiles.id, userId));
  },

  async update(userId: string, input: ProfileInput): Promise<void> {
    await db
      .update(profiles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(profiles.id, userId));
  },
};
