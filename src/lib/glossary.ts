// Lógica pura para resaltar los términos del glosario dentro de un texto y encontrar en qué
// frases aparecen. Sin imports de Expo para poder probarla con Jest.

export type Segment = { text: string; term?: string };
type Range = { start: number; end: number; term: string };

const WORD_CHAR = /[0-9a-záéíóúüñàèìòùç]/i;

function isWordChar(char: string | undefined): boolean {
  return !!char && WORD_CHAR.test(char);
}

/**
 * Busca cada término como palabra completa, sin importar mayúsculas, y acepta el plural simple
 * («modelo» encuentra «modelos»). Los términos largos tienen prioridad y no se solapan.
 */
export function findTermRanges(text: string, terms: string[]): Range[] {
  const lower = text.toLowerCase();
  const sorted = [...new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 2))].sort(
    (a, b) => b.length - a.length
  );
  const taken: Range[] = [];
  const overlaps = (start: number, end: number) => taken.some((r) => start < r.end && end > r.start);

  for (const term of sorted) {
    const needle = term.toLowerCase();
    let from = 0;
    while (from <= lower.length) {
      const start = lower.indexOf(needle, from);
      if (start === -1) break;
      let end = start + needle.length;
      // Plural simple: «s» o «es» pegados al final.
      if (lower.startsWith('es', end) && !isWordChar(lower[end + 2])) end += 2;
      else if (lower[end] === 's' && !isWordChar(lower[end + 1])) end += 1;
      if (!isWordChar(lower[start - 1]) && !isWordChar(lower[end]) && !overlaps(start, end)) {
        taken.push({ start, end, term });
      }
      from = start + needle.length;
    }
  }
  return taken.sort((a, b) => a.start - b.start);
}

/** Parte el texto en trozos normales y trozos que son un término del glosario. */
export function splitByTerms(text: string, terms: string[]): Segment[] {
  const ranges = findTermRanges(text, terms);
  if (ranges.length === 0) return [{ text }];
  const out: Segment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) out.push({ text: text.slice(cursor, range.start) });
    out.push({ text: text.slice(range.start, range.end), term: range.term });
    cursor = range.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

function sentences(text: string): string[] {
  return text
    .replace(/\r/g, '\n')
    .replace(/([.!?…])\s+/g, '$1\n')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Frases donde aparece el término: su contexto. */
export function termContexts(text: string | null | undefined, term: string, limit = 3): string[] {
  if (!text) return [];
  return sentences(text)
    .filter((sentence) => findTermRanges(sentence, [term]).length > 0)
    .slice(0, limit);
}

export function containsTerm(text: string | null | undefined, term: string): boolean {
  return !!text && findTermRanges(text, [term]).length > 0;
}

/** Mismo término sin importar mayúsculas ni el plural simple («Modelo» y «modelos»). */
export function sameTerm(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return x === y || x === `${y}s` || y === `${x}s` || x === `${y}es` || y === `${x}es`;
}

const DEFINITION_VERBS = /^(es|son|se define como|se denomina|consiste en|se refiere a|significa)\s+/i;

/**
 * Busca en el texto una frase que defina el término («La IA es…», «Los modelos son…»).
 * Sirve para los conceptos clave que no están en el glosario de la IA.
 */
export function definitionFromText(text: string | null | undefined, term: string): string | null {
  if (!text) return null;
  for (const sentence of sentences(text)) {
    const [range] = findTermRanges(sentence, [term]);
    if (!range) continue;
    // El término debe ser el sujeto: al inicio, quizá con un artículo delante.
    const before = sentence.slice(0, range.start).trim().toLowerCase();
    if (before && !/^(el|la|los|las|un|una|unos|unas|lo)$/.test(before)) continue;
    if (DEFINITION_VERBS.test(sentence.slice(range.end).trim())) return sentence;
  }
  return null;
}
