import { useMemo } from 'react';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useUserId } from '@/context/AuthContext';
import { materialsRepo } from '@/db/repositories/materials';
import { profilesRepo } from '@/db/repositories/profiles';
import { studyRepo } from '@/db/repositories/study';
import { subjectsRepo } from '@/db/repositories/subjects';
import { overallStats, subjectStats } from '@/lib/study';

// Las pantallas no importan Drizzle: leen de aquí. useLiveQuery vuelve a consultar
// cuando cambia la tabla, así que la UI siempre refleja lo que hay en SQLite.

export function useSubjects() {
  const userId = useUserId();
  return useLiveQuery(subjectsRepo.listQuery(userId), [userId]).data;
}

export function useMaterials() {
  const userId = useUserId();
  return useLiveQuery(materialsRepo.listQuery(userId), [userId]).data;
}

export function useFlashcards() {
  const userId = useUserId();
  return useLiveQuery(studyRepo.flashcardsQuery(userId), [userId]).data;
}

export function useAttempts() {
  const userId = useUserId();
  return useLiveQuery(studyRepo.attemptsQuery(userId), [userId]).data;
}

export function useActivities() {
  const userId = useUserId();
  return useLiveQuery(studyRepo.activitiesQuery(userId), [userId]).data;
}

export function useQuizQuestions(materialId: string) {
  return useLiveQuery(studyRepo.questionsQuery(materialId), [materialId]).data;
}

export function useProfile() {
  const userId = useUserId();
  return useLiveQuery(profilesRepo.query(userId), [userId]).data[0];
}

export function useMaterial(id: string) {
  const list = useMaterials();
  return useMemo(() => list.find((m) => m.id === id), [list, id]);
}

export function useSubject(id: string) {
  const list = useSubjects();
  return useMemo(() => list.find((s) => s.id === id), [list, id]);
}

/** Todo lo que necesitan Inicio, Práctica y Perfil, con las estadísticas ya calculadas. */
export function useStudyOverview() {
  const subjects = useSubjects();
  const materials = useMaterials();
  const flashcards = useFlashcards();
  const attempts = useAttempts();
  const activities = useActivities();

  const stats = useMemo(
    () => overallStats(materials, flashcards, attempts, activities),
    [materials, flashcards, attempts, activities]
  );
  const bySubject = useMemo(
    () => subjects.map((s) => subjectStats(s, materials, flashcards, attempts)),
    [subjects, materials, flashcards, attempts]
  );

  return { subjects, materials, flashcards, attempts, activities, stats, bySubject };
}
