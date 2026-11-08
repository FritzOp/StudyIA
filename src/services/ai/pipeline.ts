import { materialsRepo } from '@/db/repositories/materials';
import { profilesRepo } from '@/db/repositories/profiles';
import { studyRepo } from '@/db/repositories/study';
import type { Material } from '@/db/schema';
import { activeCareers } from '@/lib/careers';
import { fileExists, readAsBase64 } from '@/services/files';
import { generateLocally, TextTooShortError } from './localGenerator';
import { generateWithAi, guideWithAi, RemoteAiError } from './remoteGenerator';
import type { StudyPack } from './types';

/** Carreras y semestre con los que la IA enfoca la guía, los ejemplos y la profundidad. */
async function studentOf(userId: string): Promise<{ careers: string[]; semester?: string }> {
  const profile = await profilesRepo.get(userId);
  return { careers: activeCareers(profile), semester: profile?.semester };
}

export type AiContext = {
  /** Hay conexión y sesión real: se puede llamar a la Edge Function. */
  canUseCloud: boolean;
  subjectName: string;
};

const running = new Set<string>();

class MissingFileError extends Error {}

async function generateFromFile(
  material: Material,
  subject: string,
  student: { careers: string[]; semester?: string }
): Promise<StudyPack> {
  if (!material.fileUri || !fileExists(material.fileUri)) {
    throw new MissingFileError('El archivo original no está en este teléfono.');
  }
  return generateWithAi({
    title: material.title,
    subject,
    ...student,
    file: {
      base64: await readAsBase64(material.fileUri),
      mediaType: material.mimeType ?? 'image/jpeg',
    },
  });
}

async function finish(material: Material, pack: StudyPack, generator: 'ai' | 'local', subject: string) {
  await materialsRepo.saveStudyPack(material, pack, generator);
  await studyRepo.logActivity({
    userId: material.userId,
    type: 'material',
    title: material.title,
    detail: `Resumen, ${pack.flashcards.length} flashcards y ${pack.quiz.length} preguntas${
      generator === 'local' ? ' (sin IA)' : ''
    }.`,
    subjectName: subject,
    materialId: material.id,
  });
}

/**
 * Procesa un apunte. Texto: IA si hay conexión; si no, generador local. Foto/PDF: solo la IA
 * puede leerlos, así que sin conexión quedan pendientes y se retoman al volver la conexión.
 */
export async function processMaterial(materialId: string, ctx: AiContext): Promise<void> {
  if (running.has(materialId)) return;
  running.add(materialId);
  try {
    const material = await materialsRepo.getById(materialId);
    if (!material || material.deletedAt) return;
    await materialsRepo.setStatus(materialId, 'processing');

    const hasText = !!material.sourceText?.trim();

    if (ctx.canUseCloud) {
      try {
        const student = await studentOf(material.userId);
        const pack = hasText
          ? await generateWithAi({
              title: material.title,
              subject: ctx.subjectName,
              ...student,
              text: material.sourceText ?? '',
            })
          : await generateFromFile(material, ctx.subjectName, student);
        await finish(material, pack, 'ai', ctx.subjectName);
        return;
      } catch (error) {
        const isFinal =
          error instanceof MissingFileError ||
          (error instanceof RemoteAiError && error.kind === 'rejected');
        if (isFinal) {
          await materialsRepo.setStatus(materialId, 'error', (error as Error).message);
          return;
        }
        if (!hasText) {
          const reason = error instanceof Error ? error.message : 'Servicio no disponible.';
          await materialsRepo.setStatus(materialId, 'pending', `${reason} Se reintentará automáticamente.`);
          return;
        }
        // Con texto no hace falta esperar: se sigue con el generador local.
      }
    }

    if (hasText) {
      try {
        await finish(material, generateLocally(material.sourceText ?? ''), 'local', ctx.subjectName);
      } catch (error) {
        const message =
          error instanceof TextTooShortError ? error.message : 'No se pudo analizar el texto.';
        await materialsRepo.setStatus(materialId, 'error', message);
      }
      return;
    }

    await materialsRepo.setStatus(
      materialId,
      'pending',
      'StudyIA lee las fotos y los PDF en la nube: se procesará cuando tengas conexión y una cuenta iniciada.'
    );
  } finally {
    running.delete(materialId);
  }
}

const GUIDE_SOURCE_CHARS = 30_000;

/** Lo que la IA necesita para preparar la guía de un apunte que ya está procesado. */
export function guideContext(material: Pick<Material, 'summary' | 'keyConcepts' | 'sourceText'>): string {
  const parts = [
    material.summary ? `Resumen:\n${material.summary}` : '',
    material.keyConcepts?.length ? `Conceptos clave: ${material.keyConcepts.join(', ')}` : '',
    material.sourceText?.trim() ? `Texto original:\n${material.sourceText.slice(0, GUIDE_SOURCE_CHARS)}` : '',
  ];
  return parts.filter(Boolean).join('\n\n');
}

/**
 * Genera solo la guía de estudio, para apuntes creados antes de que existiera o cuyas carreras
 * cambiaron. No toca las flashcards ni el quiz, así que no se pierde el progreso del repaso.
 */
export async function generateGuide(material: Material, subjectName: string): Promise<void> {
  const guide = await guideWithAi({
    title: material.title,
    subject: subjectName,
    ...(await studentOf(material.userId)),
    context: guideContext(material),
  });
  await materialsRepo.saveGuide(material.id, guide);
}

/** Retoma lo pendiente, incluidos los apuntes que quedaron a medias si la app se cerró. */
export async function processPending(
  userId: string,
  canUseCloud: boolean,
  subjectNameOf: (subjectId: string) => string
): Promise<void> {
  const unprocessed = await materialsRepo.listUnprocessed(userId);
  for (const material of unprocessed) {
    if (running.has(material.id)) continue;
    const isFileOnly = !material.sourceText?.trim();
    // El archivo solo existe en el teléfono donde se subió: otro dispositivo no debe tocarlo.
    if (isFileOnly && !material.fileUri) continue;
    if (isFileOnly && !canUseCloud) {
      if (material.status === 'processing') await materialsRepo.setStatus(material.id, 'pending');
      continue;
    }
    await processMaterial(material.id, {
      canUseCloud,
      subjectName: subjectNameOf(material.subjectId),
    });
  }
}
