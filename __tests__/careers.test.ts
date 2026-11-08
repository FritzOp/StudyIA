import {
  activeCareers,
  activeFaculties,
  addCareer,
  careerInfo,
  careerList,
  FACULTY_ACCENTS,
  makePrincipal,
  MAX_CAREERS,
  levelForSemester,
  removeCareer,
  semesterLabel,
  semesterNumber,
  suggestSubjects,
} from '../src/lib/careers';
import { uniguajiraFaculties } from '../src/data/uniguajiraData';

const profile = (career: string, extraCareers: string[] = [], mixCareers = false) => ({
  career,
  extraCareers,
  mixCareers,
});

describe('careerInfo', () => {
  it('encuentra la facultad sin importar tildes ni mayúsculas', () => {
    expect(careerInfo('ingenieria de sistemas').facultyId).toBe('ingenieria');
    expect(careerInfo('  PSICOLOGÍA ').facultyId).toBe('sociales');
  });

  it('acepta carreras que no están en el catálogo', () => {
    const info = careerInfo('Astronomía');
    expect(info.facultyId).toBeNull();
    expect(info.name).toBe('Astronomía');
  });

  it('todas las facultades del catálogo tienen colores', () => {
    for (const faculty of uniguajiraFaculties) expect(FACULTY_ACCENTS[faculty.id]).toBeDefined();
  });
});

describe('careerList y activeCareers', () => {
  it('pone la principal primero y quita vacías y repetidas', () => {
    expect(careerList(profile('Derecho', ['', 'derecho', 'Medicina']))).toEqual(['Derecho', 'Medicina']);
  });

  it('sin mezclar solo cuenta la principal; al mezclar, todas', () => {
    expect(activeCareers(profile('Derecho', ['Medicina']))).toEqual(['Derecho']);
    expect(activeCareers(profile('Derecho', ['Medicina'], true))).toEqual(['Derecho', 'Medicina']);
  });

  it('las facultades activas no se repiten', () => {
    expect(activeFaculties(profile('Ingeniería de Sistemas', ['Ingeniería Civil', 'Medicina'], true))).toEqual([
      'ingenieria',
      'salud',
    ]);
  });
});

describe('agregar, quitar y cambiar la principal', () => {
  it('no agrega repetidas ni pasa del máximo', () => {
    expect(addCareer(['Derecho'], 'derecho')).toEqual(['Derecho']);
    const full = ['A', 'B', 'C'];
    expect(full).toHaveLength(MAX_CAREERS);
    expect(addCareer(full, 'D')).toBe(full);
  });

  it('siempre deja al menos una carrera', () => {
    expect(removeCareer(['Derecho'], 'Derecho')).toEqual(['Derecho']);
    expect(removeCareer(['Derecho', 'Medicina'], 'derecho')).toEqual(['Medicina']);
  });

  it('cambia la principal conservando las demás', () => {
    expect(makePrincipal(['Derecho', 'Medicina', 'Química'], 'Química')).toEqual(['Química', 'Derecho', 'Medicina']);
  });
});

describe('suggestSubjects', () => {
  it('sugiere asignaturas de la facultad y omite las que ya existen', () => {
    const names = suggestSubjects(['Ingeniería de Sistemas'], ['Bases de datos']).map((s) => s.name);
    expect(names.length).toBeGreaterThan(0);
    expect(names).not.toContain('Bases de Datos');
    expect(names[0]).toBe('Introducción a la Ingeniería');
  });

  it('con dos carreras intercala las dos áreas', () => {
    const areas = suggestSubjects(['Ingeniería de Sistemas', 'Administración de Empresas'], [], 4).map((s) => s.area);
    expect(areas).toEqual(['Ingeniería', 'Administración', 'Ingeniería', 'Administración']);
  });
});

describe('semestre', () => {
  it('lee el número de los formatos usados', () => {
    expect(semesterNumber('3er Semestre')).toBe(3);
    expect(semesterNumber('semestre 10')).toBe(10);
    expect(semesterNumber('Egresado')).toBeNull();
    expect(semesterNumber('15')).toBeNull();
    expect(semesterLabel(5)).toBe('5to Semestre');
  });

  it('el nivel del catálogo crece con el semestre sin pasar de 7', () => {
    expect(levelForSemester(1)).toBe(1);
    expect(levelForSemester(5)).toBe(4);
    expect(levelForSemester(10)).toBe(7);
  });

  it('con semestre, primero sugiere asignaturas de su nivel', () => {
    const first = suggestSubjects(['Ingeniería de Sistemas'], [], 3, 5);
    expect(first.every((s) => /-4\d\d$/.test(s.code))).toBe(true);
  });
});
