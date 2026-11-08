import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { StudyGuide, StudyPack } from './types';

const FUNCTION_NAME = 'study-ai';

/**
 * - unavailable: sin red, función no desplegada, sin clave o cuota agotada. Se puede reintentar.
 * - rejected: la IA o el servidor rechazaron este contenido. Reintentar igual no ayuda.
 */
export class RemoteAiError extends Error {
  constructor(
    message: string,
    readonly kind: 'unavailable' | 'rejected'
  ) {
    super(message);
    this.name = 'RemoteAiError';
  }
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(FUNCTION_NAME, { body });
  if (!error && data) return data;

  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    let payload: { error?: string } = {};
    try {
      payload = await response.json();
    } catch {
      // La respuesta no es JSON (p. ej. la función no está desplegada).
    }
    const retryable = response.status === 404 || response.status === 429 || response.status >= 500;
    throw new RemoteAiError(
      payload.error ?? 'StudyIA no está disponible en este momento.',
      retryable ? 'unavailable' : 'rejected'
    );
  }
  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    throw new RemoteAiError('No se pudo contactar a StudyIA.', 'unavailable');
  }
  throw new RemoteAiError('Respuesta inesperada de StudyIA.', 'unavailable');
}

export async function generateWithAi(input: {
  title: string;
  subject: string;
  careers: string[];
  semester?: string;
  text?: string;
  file?: { base64: string; mediaType: string };
}): Promise<StudyPack> {
  return invoke<StudyPack>({ action: 'generate', ...input });
}

/** Guía para un apunte ya procesado: se arma con su resumen, conceptos y texto. */
export async function guideWithAi(input: {
  title: string;
  subject: string;
  careers: string[];
  semester?: string;
  context: string;
}): Promise<StudyGuide> {
  const { guide } = await invoke<{ guide: StudyGuide }>({ action: 'guide', ...input });
  return guide;
}

/** Qué significa un término dentro del tema del apunte, con un ejemplo. */
export async function termWithAi(input: {
  term: string;
  title: string;
  context: string;
  careers: string[];
  semester?: string;
}): Promise<{ meaning: string; example: string }> {
  const { meaning, example } = await invoke<{ meaning: string; example: string }>({ action: 'term', ...input });
  return { meaning, example };
}

export async function explainWithAi(input: {
  question: string;
  title: string;
  context: string;
  careers: string[];
  semester?: string;
}): Promise<string> {
  const { answer } = await invoke<{ answer: string }>({ action: 'explain', ...input });
  return answer;
}
