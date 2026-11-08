import { PROGRAM_SUBJECTS } from '@/data/programSubjects';
import { getAllUndergraduatePrograms, uniguajiraCurriculumSubjects } from '@/data/uniguajiraData';
import { careerInfo, normalize } from '@/lib/careers';

// Sugerencias de materias: primero el plan de referencia de las carreras del estudiante,
// ordenado por cercanía a su semestre; al escribir, se busca en todos los planes y en el catálogo.
// Sin imports de Expo para poder probarlo con Jest.

export type SubjectSuggestion = {
  name: string;
  code: string;
  desc: string;
  icon: string;
  /** De dónde viene: el programa («Medicina») o el área del catálogo general. */
  source: string;
  /** Semestre típico en el plan de referencia (no aplica al catálogo general). */
  semester?: number;
};

const GENERIC_PREFIXES = new Set(['GEN', 'ING', 'TEC', 'LIC', 'ADM']);
const programs = getAllUndergraduatePrograms();

/** Prefijo del código de las materias de un programa: «Medicina» (MED-GEN) usa MED. */
function prefixOf(programCode: string): string {
  return programCode.split('-').find((part) => !GENERIC_PREFIXES.has(part)) ?? programCode.split('-')[0];
}

/** Materias del plan de referencia de un programa del catálogo. */
export function programSubjects(programId: string): SubjectSuggestion[] {
  const plan = PROGRAM_SUBJECTS[programId];
  const program = programs.find((p) => p.id === programId);
  if (!plan || !program) return [];
  const prefix = prefixOf(program.code);
  const perSemester = new Map<number, number>();
  return plan.subjects.map(([name, semester]) => {
    const index = (perSemester.get(semester) ?? 0) + 1;
    perSemester.set(semester, index);
    return {
      name,
      code: `${prefix}-${semester}${String(index).padStart(2, '0')}`,
      desc: '',
      icon: plan.icon,
      source: program.name,
      semester,
    };
  });
}

const catalogSubjects: SubjectSuggestion[] = uniguajiraCurriculumSubjects.map((s) => ({
  name: s.name,
  code: s.code,
  desc: s.desc,
  icon: s.icon,
  source: s.area,
}));

/** Materias generales para una carrera escrita a mano, que no está en el catálogo. */
const GENERAL_AREAS = ['Investigación', 'Humanidades', 'Identidad Uniguajira'];

function subjectsForCareer(career: string): SubjectSuggestion[] {
  const { programId } = careerInfo(career);
  if (programId) return programSubjects(programId);
  return catalogSubjects.filter((s) => GENERAL_AREAS.includes(s.source));
}

/**
 * Orden por semestre: primero las del semestre actual, luego las más cercanas; a igual
 * distancia, las anteriores (repaso) antes que las siguientes.
 */
export function bySemester(subjects: SubjectSuggestion[], semester: number | null): SubjectSuggestion[] {
  if (!semester) return [...subjects].sort((a, b) => (a.semester ?? 99) - (b.semester ?? 99));
  const distance = (s: SubjectSuggestion) => {
    if (s.semester === undefined) return 100;
    const d = s.semester - semester;
    return d <= 0 ? -d * 2 : d * 2 + 1;
  };
  return subjects
    .map((subject, index) => ({ subject, index }))
    .sort((a, b) => distance(a.subject) - distance(b.subject) || a.index - b.index)
    .map((x) => x.subject);
}

/**
 * Materias sugeridas para crear, sin las que el estudiante ya tiene. Con varias carreras se
 * intercalan para que ninguna acapare la lista.
 */
export function suggestSubjects(
  careers: string[],
  existingNames: string[],
  limit = 12,
  semester: number | null = null
): SubjectSuggestion[] {
  const taken = new Set(existingNames.map(normalize));
  const queues = (careers.length > 0 ? careers : ['']).map((career) =>
    bySemester(subjectsForCareer(career), semester).filter((s) => !taken.has(normalize(s.name)))
  );
  const out: SubjectSuggestion[] = [];
  const used = new Set<string>();
  for (let i = 0; out.length < limit && queues.some((q) => i < q.length); i++) {
    for (const queue of queues) {
      const subject = queue[i];
      if (!subject || used.has(normalize(subject.name))) continue;
      used.add(normalize(subject.name));
      out.push(subject);
      if (out.length === limit) break;
    }
  }
  return out;
}

/**
 * Búsqueda mientras el estudiante escribe, sin importar tildes ni mayúsculas. Ordena primero
 * por cómo coincide (empieza igual, empieza una palabra, contiene) y, dentro de eso, las de
 * sus carreras antes que las de otras carreras y que el catálogo general.
 */
export function searchSubjects(query: string, careers: string[], limit = 8): SubjectSuggestion[] {
  const q = normalize(query);
  if (!q) return [];
  const own = careers.flatMap(subjectsForCareer);
  const others = programs.flatMap((p) => programSubjects(p.id));
  const pool: { subject: SubjectSuggestion; rank: number }[] = [];
  const seen = new Set<string>();
  const add = (subjects: SubjectSuggestion[], rank: number) => {
    for (const subject of subjects) {
      const key = normalize(subject.name);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ subject, rank });
    }
  };
  add(own, 0);
  add(catalogSubjects, 1);
  add(others, 2);

  const matchScore = (name: string) => {
    const n = normalize(name);
    if (n.startsWith(q)) return 0;
    if (n.split(/[\s:,]+/).some((word) => word.startsWith(q))) return 1;
    return n.includes(q) ? 2 : -1;
  };
  return pool
    .map((item) => ({ ...item, score: matchScore(item.subject.name) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => a.score - b.score || a.rank - b.rank)
    .slice(0, limit)
    .map((item) => item.subject);
}
