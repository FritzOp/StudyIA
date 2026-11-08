import AsyncStorage from '@react-native-async-storage/async-storage';
import { materialsRepo } from '@/db/repositories/materials';
import type { Material } from '@/db/schema';
import { sameTerm } from '@/lib/glossary';

// Significados que la IA explicó al tocar una palabra. Si el apunte tiene guía, se agregan a su
// glosario (se sincroniza con la nube); si no, se guardan en el teléfono para no gastar cuota otra vez.

export type TermMeaning = { meaning: string; example: string };

const keyOf = (materialId: string, term: string) => `studyia.term.${materialId}.${term.trim().toLowerCase()}`;

export function meaningFromGuide(material: Material, term: string): TermMeaning | null {
  const entry = material.guide?.glossary.find((g) => sameTerm(g.term, term));
  return entry ? { meaning: entry.meaning, example: entry.example ?? '' } : null;
}

export async function cachedMeaning(materialId: string, term: string): Promise<TermMeaning | null> {
  try {
    const raw = await AsyncStorage.getItem(keyOf(materialId, term));
    return raw ? (JSON.parse(raw) as TermMeaning) : null;
  } catch {
    return null;
  }
}

export async function rememberMeaning(material: Material, term: string, value: TermMeaning): Promise<void> {
  if (material.guide && !material.guide.glossary.some((g) => sameTerm(g.term, term))) {
    await materialsRepo.saveGuide(material.id, {
      ...material.guide,
      glossary: [...material.guide.glossary, { term, ...value }],
    });
    return;
  }
  await AsyncStorage.setItem(keyOf(material.id, term), JSON.stringify(value)).catch(() => undefined);
}
