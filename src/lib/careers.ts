import { uniguajiraCurriculumSubjects, uniguajiraFaculties } from '@/data/uniguajiraData';

// Lógica pura de las carreras: qué facultad es cada una, qué colores le pone a la app y qué
// asignaturas sugiere. Sin imports de Expo para poder probarla con Jest.

export const MAX_CAREERS = 3;

/** Colores de una facultad en un modo (claro u oscuro). */
export type AccentShades = {
  primary: string;
  /** Texto o ícono que va encima de `primary` (botones). */
  onPrimary: string;
  /** Fondo suave del acento: chips, avatares, íconos. */
  primaryLight: string;
  /** Fondo de la tarjeta principal de Inicio. */
  hero: string;
};

export type FacultyAccent = { light: AccentShades; dark: AccentShades };

/**
 * Tonos verificados por contraste. En claro, el acento lleva texto blanco (≥ 4.5:1). En oscuro se
 * usa el tono claro de la misma familia con texto oscuro encima, porque ningún tono intermedio
 * sirve a la vez para texto blanco y para leerse sobre las tarjetas oscuras. Ingeniería conserva
 * el índigo original de la app.
 */
export const FACULTY_ACCENTS: Record<string, FacultyAccent> = {
  ingenieria: {
    light: { primary: '#6366F1', onPrimary: '#FFFFFF', primaryLight: '#EEF2FF', hero: '#312E81' },
    dark: { primary: '#6366F1', onPrimary: '#FFFFFF', primaryLight: 'rgba(99, 102, 241, 0.2)', hero: '#1E1B4B' },
  },
  economicas: {
    light: { primary: '#0E7490', onPrimary: '#FFFFFF', primaryLight: '#ECFEFF', hero: '#164E63' },
    dark: { primary: '#22D3EE', onPrimary: '#0B0F19', primaryLight: 'rgba(34, 211, 238, 0.16)', hero: '#083344' },
  },
  sociales: {
    light: { primary: '#DB2777', onPrimary: '#FFFFFF', primaryLight: '#FDF2F8', hero: '#831843' },
    dark: { primary: '#F472B6', onPrimary: '#0B0F19', primaryLight: 'rgba(244, 114, 182, 0.16)', hero: '#500724' },
  },
  educacion: {
    light: { primary: '#B45309', onPrimary: '#FFFFFF', primaryLight: '#FFFBEB', hero: '#78350F' },
    dark: { primary: '#FBBF24', onPrimary: '#0B0F19', primaryLight: 'rgba(251, 191, 36, 0.16)', hero: '#451A03' },
  },
  basicas: {
    light: { primary: '#047857', onPrimary: '#FFFFFF', primaryLight: '#ECFDF5', hero: '#064E3B' },
    dark: { primary: '#34D399', onPrimary: '#0B0F19', primaryLight: 'rgba(52, 211, 153, 0.16)', hero: '#022C22' },
  },
  salud: {
    light: { primary: '#DC2626', onPrimary: '#FFFFFF', primaryLight: '#FEF2F2', hero: '#7F1D1D' },
    dark: { primary: '#F87171', onPrimary: '#0B0F19', primaryLight: 'rgba(248, 113, 113, 0.16)', hero: '#450A0A' },
  },
  artes: {
    light: { primary: '#7C3AED', onPrimary: '#FFFFFF', primaryLight: '#F5F3FF', hero: '#4C1D95' },
    dark: { primary: '#A78BFA', onPrimary: '#0B0F19', primaryLight: 'rgba(167, 139, 250, 0.16)', hero: '#2E1065' },
  },
};

export const DEFAULT_FACULTY = 'ingenieria';

/** Áreas del plan de estudios que le interesan a cada facultad, de la más a la menos afín. */
const FACULTY_AREAS: Record<string, string[]> = {
  ingenieria: ['Ingeniería', 'Ciencias Básicas', 'Investigación'],
  economicas: ['Administración', 'Economía', 'Finanzas', 'Negocios', 'Investigación'],
  sociales: ['Ciencias Sociales', 'Humanidades', 'Investigación'],
  educacion: ['Educación', 'Humanidades', 'Identidad Uniguajira', 'Investigación'],
  basicas: ['Ciencias Básicas', 'Investigación'],
  salud: ['Ciencias Básicas', 'Ciencias Sociales', 'Investigación'],
  artes: ['Humanidades', 'Identidad Uniguajira', 'Investigación'],
};

export type CareerInfo = {
  name: string;
  /** null si el estudiante escribió una carrera que no está en el catálogo. */
  facultyId: string | null;
  facultyName: string | null;
  icon: string;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

/** Busca la carrera en el catálogo sin importar tildes ni mayúsculas. */
export function careerInfo(name: string): CareerInfo {
  const key = normalize(name);
  for (const faculty of uniguajiraFaculties) {
    if (faculty.programs.some((p) => normalize(p.name) === key)) {
      return { name: name.trim(), facultyId: faculty.id, facultyName: faculty.name, icon: faculty.icon };
    }
  }
  return { name: name.trim(), facultyId: null, facultyName: null, icon: 'school-outline' };
}

type CareerProfile = { career: string; extraCareers: string[]; mixCareers: boolean };

/** Todas las carreras, la principal primero, sin vacíos ni repetidas. */
export function careerList(profile: CareerProfile | undefined): string[] {
  if (!profile) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [profile.career, ...(profile.extraCareers ?? [])]) {
    const name = raw?.trim();
    if (!name || seen.has(normalize(name))) continue;
    seen.add(normalize(name));
    out.push(name);
  }
  return out.slice(0, MAX_CAREERS);
}

/** Las carreras que usan el tema y la IA: todas si se mezclan, si no solo la principal. */
export function activeCareers(profile: CareerProfile | undefined): string[] {
  const list = careerList(profile);
  return profile?.mixCareers ? list : list.slice(0, 1);
}

/** Facultades de las carreras activas, sin repetir y en orden. */
export function activeFaculties(profile: CareerProfile | undefined): string[] {
  const ids = activeCareers(profile)
    .map((c) => careerInfo(c).facultyId)
    .filter((id): id is string => !!id);
  return [...new Set(ids)];
}

export function addCareer(list: string[], name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed || list.length >= MAX_CAREERS) return list;
  if (list.some((c) => normalize(c) === normalize(trimmed))) return list;
  return [...list, trimmed];
}

export function removeCareer(list: string[], name: string): string[] {
  // Siempre debe quedar al menos una carrera.
  if (list.length <= 1) return list;
  return list.filter((c) => normalize(c) !== normalize(name));
}

export function makePrincipal(list: string[], name: string): string[] {
  const found = list.find((c) => normalize(c) === normalize(name));
  if (!found) return list;
  return [found, ...list.filter((c) => c !== found)];
}

export type SubjectSuggestion = (typeof uniguajiraCurriculumSubjects)[number];

/**
 * Asignaturas del plan de estudios afines a las carreras, sin las que el estudiante ya creó.
 * Con varias carreras se intercalan para que ninguna acapare la lista; con semestre, primero
 * van las del nivel que está cursando.
 */
export function suggestSubjects(
  careers: string[],
  existingNames: string[],
  limit = 8,
  semester: number | null = null
): SubjectSuggestion[] {
  const taken = new Set(existingNames.map(normalize));
  const faculties = [...new Set(careers.map((c) => careerInfo(c).facultyId ?? DEFAULT_FACULTY))];
  if (faculties.length === 0) faculties.push(DEFAULT_FACULTY);

  const queues = faculties.map((id) =>
    bySemester(
      (FACULTY_AREAS[id] ?? []).flatMap((area) => uniguajiraCurriculumSubjects.filter((s) => s.area === area)),
      semester
    )
  );
  const out: SubjectSuggestion[] = [];
  const used = new Set<string>();
  for (let i = 0; out.length < limit && queues.some((q) => i < q.length); i++) {
    for (const queue of queues) {
      const subject = queue[i];
      if (!subject || used.has(subject.code) || taken.has(normalize(subject.name))) continue;
      used.add(subject.code);
      out.push(subject);
      if (out.length === limit) break;
    }
  }
  return out;
}

// --- Semestre ---------------------------------------------------------------------------

const ORDINALS = ['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'];

/** Semestres que se pueden elegir, con el mismo formato que ya usaba el perfil («1er Semestre»). */
export const SEMESTERS = ORDINALS.map((ordinal, index) => ({
  number: index + 1,
  short: ordinal,
  label: `${ordinal} Semestre`,
}));

/** Lee el número de semestre de textos como «3er Semestre», «semestre 3» o «3». */
export function semesterNumber(label: string | null | undefined): number | null {
  const match = label?.match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return n >= 1 && n <= SEMESTERS.length ? n : null;
}

export function semesterLabel(n: number): string {
  return SEMESTERS[Math.min(Math.max(n, 1), SEMESTERS.length) - 1].label;
}

/** Nivel de una asignatura según su código: «SIS-301» es de nivel 3. */
function subjectLevel(code: string): number {
  const match = code.match(/-(\d)\d\d$/);
  return match ? Math.max(1, Number(match[1])) : 1;
}

/** Nivel del catálogo (1 a 7) que corresponde a un semestre (1 a 10). */
export function levelForSemester(semester: number): number {
  return Math.min(7, Math.max(1, Math.ceil(semester * 0.7)));
}

/** Ordena por cercanía al nivel del semestre; a igual distancia conserva el orden original. */
export function bySemester<T extends { code: string }>(subjects: T[], semester: number | null): T[] {
  if (!semester) return subjects;
  const target = levelForSemester(semester);
  return subjects
    .map((subject, index) => ({ subject, index, distance: Math.abs(subjectLevel(subject.code) - target) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map((x) => x.subject);
}
