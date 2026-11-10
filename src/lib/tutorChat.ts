// Qué se le envía al tutor en cada mensaje: el historial de la conversación y los archivos que
// necesita ver (la foto o el PDF original del apunte y los últimos adjuntos). Lógica pura, sin
// imports de Expo, para poder probarla con Jest.

export type ChatAttachment = { uri: string; mimeType: string; name: string };
export type ChatMessage = { role: 'user' | 'assistant'; text: string; attachments: ChatAttachment[] };
export type FileToSend = { uri: string; mimeType: string; label: string };

/** Tipos que la IA puede leer como archivo. */
export const READABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

export const MAX_CHAT_FILES = 5;
export const MAX_HISTORY = 20;
/** Margen bajo el límite de la Edge Function (9 millones de caracteres en base64). */
export const MAX_FILES_BASE64 = 8_500_000;

type MaterialFile = { fileUri: string | null; mimeType: string | null };

/**
 * Archivos para la próxima pregunta: siempre el original del apunte y luego los adjuntos más
 * recientes de la conversación (el más nuevo primero, hasta completar el máximo).
 */
export function filesToSend(material: MaterialFile, messages: ChatMessage[], max = MAX_CHAT_FILES): FileToSend[] {
  const files: FileToSend[] = [];
  if (material.fileUri && material.mimeType && READABLE_TYPES.includes(material.mimeType)) {
    files.push({
      uri: material.fileUri,
      mimeType: material.mimeType,
      label: material.mimeType === 'application/pdf' ? 'PDF original del apunte' : 'Foto original del apunte',
    });
  }
  for (let i = messages.length - 1; i >= 0 && files.length < max; i--) {
    for (const attachment of [...messages[i].attachments].reverse()) {
      if (files.length >= max) break;
      if (!READABLE_TYPES.includes(attachment.mimeType)) continue;
      files.push({ uri: attachment.uri, mimeType: attachment.mimeType, label: `Adjunto del estudiante: ${attachment.name}` });
    }
  }
  return files;
}

/** Historial en texto para la IA. Menciona los adjuntos para que sepa a cuál se refieren. */
export function historyToSend(messages: ChatMessage[], max = MAX_HISTORY): { role: 'user' | 'assistant'; text: string }[] {
  return messages.slice(-max).map((m) => ({
    role: m.role,
    text: m.attachments.length > 0 ? `${m.text}\n[Adjuntó: ${m.attachments.map((a) => a.name).join(', ')}]` : m.text,
  }));
}

/** Si el estudiante solo adjunta archivos sin escribir, se envía una pregunta por defecto. */
export function questionText(text: string, attachments: ChatAttachment[]): string {
  const trimmed = text.trim();
  if (trimmed) return trimmed;
  if (attachments.length === 0) return '';
  return attachments.length === 1 ? 'Revisa el archivo que adjunté y explícamelo.' : 'Revisa los archivos que adjunté y explícamelos.';
}

/** Recorta la lista para no pasar del tamaño permitido, conservando primero los de mayor prioridad. */
export function fitToBudget<T extends { base64: string }>(files: T[], budget = MAX_FILES_BASE64): T[] {
  const out: T[] = [];
  let total = 0;
  for (const file of files) {
    if (total + file.base64.length > budget) continue;
    total += file.base64.length;
    out.push(file);
  }
  return out;
}
