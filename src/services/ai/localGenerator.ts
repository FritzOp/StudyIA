import type { StudyPack } from './types';

/**
 * Generador sin conexión. NO es inteligencia artificial: es un análisis extractivo por
 * frecuencia de términos que permite estudiar en modo avión. Reutiliza frases del propio
 * apunte, y la app lo muestra como "Generado sin IA" para que el estudiante pueda
 * mejorarlo con IA cuando tenga conexión.
 */

const STOPWORDS = new Set(
  `permite permiten utiliza utilizan usa usan partir través forma manera ejemplo parte tipo a acá ahí al algo algunas algunos allá allí ante antes aquel aquella aquellas aquellos aquí así aun aunque bien cada casi como con contra cual cuales cuando de del desde donde dos durante e el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba están estar estas este esto estos fue fueron ha había han hasta hay la las le les lo los más me mediante mi mientras muy nada ni no nos nuestra nuestro o otra otras otro otros para pero poco por porque puede pueden que quien se según ser si sí sido sin sino sobre son su sus tal también tan tanto te tiene tienen toda todas todo todos tras tu un una uno unos unas usar uso y ya the of and to in is are for that with this`.split(
    ' '
  )
);

const DEFINITION =
  /^(.{3,70}?)\s+(es|son|se define como|se denomina|consiste en|se refiere a|significa)\s+(.{12,})$/i;
const ARTICLE = /^(el|la|los|las|un|una|unos|unas|lo)\s+/i;

export class TextTooShortError extends Error {
  constructor() {
    super('El texto es muy corto para generar material de estudio. Escribe al menos dos frases completas.');
    this.name = 'TextTooShortError';
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Minúscula inicial para usarlo en medio de una frase, salvo nombres como "Machine Learning". */
function inlineTerm(term: string): string {
  return /[A-ZÁÉÍÓÚÑ]/.test(term.slice(1)) ? term : term.charAt(0).toLowerCase() + term.slice(1);
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, '\n')
    .replace(/([.!?…])\s+/g, '$1\n')
    .split(/\n+/)
    .map((s) => s.replace(/^[\s•*\-–\d.)]+/, '').trim())
    .filter((s) => s.split(/\s+/).length >= 4);
}

function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-záéíóúüñ][a-záéíóúüñ0-9-]+/g) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w)
  );
}

function frequencies(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return freq;
}

type Definition = { term: string; plural: boolean; meaning: string; sentence: string };

function findDefinitions(sentences: string[]): Definition[] {
  const found: Definition[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const match = sentence.match(DEFINITION);
    if (!match) continue;
    const term = match[1].replace(ARTICLE, '').replace(/[,:;]+$/, '').trim();
    const key = term.toLowerCase();
    if (term.split(/\s+/).length > 6 || term.includes(',') || seen.has(key)) continue;
    seen.add(key);
    found.push({
      term,
      plural: match[2].toLowerCase() === 'son',
      meaning: match[3].replace(/[.;]+$/, '').trim(),
      sentence,
    });
  }
  return found;
}

/** Combina términos definidos y las palabras más frecuentes, sin repetirse entre sí. */
function pickConcepts(definitions: Definition[], freq: Map<string, number>, limit: number): string[] {
  const concepts = definitions.map((d) => capitalize(d.term));
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word);
  for (const word of ranked) {
    if (concepts.length >= limit) break;
    if (!concepts.some((c) => c.toLowerCase().includes(word))) concepts.push(capitalize(word));
  }
  return concepts.slice(0, limit);
}

/** Posición pseudoaleatoria pero estable, para que el mismo texto dé el mismo quiz. */
function stableIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % modulo;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blankOut(sentence: string, concept: string): string | null {
  const pattern = new RegExp(`(^|[^a-záéíóúüñ])${escapeRegExp(concept)}(?![a-záéíóúüñ])`, 'i');
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, (_, prefix: string) => `${prefix}_____`);
}

export function generateLocally(text: string): StudyPack {
  const sentences = splitSentences(text);
  const tokens = words(text);
  if (sentences.length < 2 || tokens.length < 12) throw new TextTooShortError();

  const freq = frequencies(tokens);
  const scored = sentences.map((sentence, index) => {
    const own = words(sentence);
    const weight = own.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0) / Math.max(own.length, 1);
    return { sentence, index, score: weight + (index === 0 ? 1 : 0) };
  });

  const summaryCount = Math.min(5, Math.max(2, Math.ceil(sentences.length * 0.3)));
  const summary = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, summaryCount)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence)
    .join(' ');

  const definitions = findDefinitions(sentences);
  const concepts = pickConcepts(definitions, freq, 8);

  const flashcards = definitions.slice(0, 8).map((d) => ({
    question: `¿Qué ${d.plural ? 'son' : 'es'} ${inlineTerm(d.term)}?`,
    answer: capitalize(d.meaning) + '.',
  }));
  const ranked = [...scored].sort((a, b) => b.score - a.score);
  for (const { sentence } of ranked) {
    if (flashcards.length >= 8) break;
    const concept = concepts.find((c) => blankOut(sentence, c));
    if (!concept) continue;
    const question = `Completa la idea: ${blankOut(sentence, concept)}`;
    if (!flashcards.some((f) => f.question === question)) {
      flashcards.push({ question, answer: concept });
    }
  }

  const quiz: StudyPack['quiz'] = [];
  if (concepts.length >= 4) {
    for (const { sentence } of ranked) {
      if (quiz.length >= 5) break;
      const concept = concepts.find((c) => blankOut(sentence, c));
      if (!concept) continue;
      const question = `¿Qué término completa la frase? "${blankOut(sentence, concept)}"`;
      if (quiz.some((q) => q.question === question)) continue;
      const distractors = concepts.filter((c) => c !== concept);
      const offset = stableIndex(sentence, distractors.length);
      const options = [0, 1, 2].map((i) => distractors[(offset + i) % distractors.length]);
      const correctIndex = stableIndex(concept + sentence, 4);
      options.splice(correctIndex, 0, concept);
      quiz.push({ question, options, correctIndex, explanation: sentence });
    }
  }

  return { summary, keyConcepts: concepts, flashcards, quiz };
}
