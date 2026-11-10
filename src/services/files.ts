import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_IMAGE_SIDE = 1600;
export const MAX_DOCUMENT_BYTES = 6 * 1024 * 1024;

function materialsDir(): Directory {
  const dir = new Directory(Paths.document, 'materials');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Copia el archivo de la caché al directorio permanente. La ruta es lo que se guarda en SQLite. */
export async function persistFile(uri: string, id: string, extension: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  const target = new File(materialsDir(), `${id}.${extension}`);
  await new File(uri).copy(target);
  return target.uri;
}

/** Guarda un adjunto del chat del tutor para que siga disponible en las próximas preguntas. */
export async function persistAttachment(uri: string, id: string, extension: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  const dir = new Directory(Paths.document, 'tutor');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const target = new File(dir, `${id}.${extension}`);
  await new File(uri).copy(target);
  return target.uri;
}

export function deleteLocalFile(uri: string | null): void {
  if (!uri || Platform.OS === 'web') return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

export function fileExists(uri: string): boolean {
  if (Platform.OS === 'web') return true;
  return new File(uri).exists;
}

/** Reduce la foto antes de enviarla: menos datos móviles y dentro del límite de la API de visión. */
export async function compressImage(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_IMAGE_SIDE, height: null });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  return saved.uri;
}

export async function readAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  return new File(uri).base64();
}

export async function readAsText(uri: string): Promise<string> {
  if (Platform.OS === 'web') return (await fetch(uri)).text();
  return new File(uri).text();
}
