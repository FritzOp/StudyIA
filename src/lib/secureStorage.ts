import * as SecureStore from 'expo-secure-store';

// SecureStore tiene un límite práctico de ~2 KB por valor y la sesión de Supabase lo supera,
// así que cada valor se parte en fragmentos: <key>.count, <key>.0, <key>.1, ...
const CHUNK_SIZE = 1800;

const countKey = (key: string) => `${key}.count`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

async function removeItem(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(countKey(key)));
  if (Number.isFinite(count)) {
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(chunkKey(key, i));
  }
  await SecureStore.deleteItemAsync(countKey(key));
}

async function getItem(key: string): Promise<string | null> {
  const rawCount = await SecureStore.getItemAsync(countKey(key));
  if (rawCount == null) return null;
  const count = Number(rawCount);
  if (!(count > 0)) return null;
  let value = '';
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part == null) return null; // sesión corrupta: se trata como inexistente
    value += part;
  }
  return value;
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key);
  const chunks: string[] = [];
  for (let start = 0; start < value.length; start += CHUNK_SIZE) {
    chunks.push(value.slice(start, start + CHUNK_SIZE));
  }
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), chunks[i]);
  }
  await SecureStore.setItemAsync(countKey(key), String(chunks.length));
}

// Cola: las operaciones corren una tras otra para que dos escrituras seguidas
// no mezclen fragmentos de sesiones distintas.
let queue: Promise<unknown> = Promise.resolve();
function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/** Adaptador compatible con la opción auth.storage de supabase-js. */
export const secureStorage = {
  getItem: (key: string) => serialized(() => getItem(key)),
  setItem: (key: string, value: string) => serialized(() => setItem(key, value)),
  removeItem: (key: string) => serialized(() => removeItem(key)),
};
