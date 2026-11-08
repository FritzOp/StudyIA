import {
  activeCareers,
  activeFaculties,
  addCareer,
  careerInfo,
  careerList,
  FACULTY_ACCENTS,
  makePrincipal,
  MAX_CAREERS,
  removeCareer,
  semesterLabel,
  semesterNumber,
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

describe('semestre', () => {
  it('lee el número de los formatos usados', () => {
    expect(semesterNumber('3er Semestre')).toBe(3);
    expect(semesterNumber('semestre 10')).toBe(10);
    expect(semesterNumber('Egresado')).toBeNull();
    expect(semesterNumber('15')).toBeNull();
    expect(semesterNumber('12vo Semestre')).toBe(12);
    expect(semesterLabel(5)).toBe('5to Semestre');
  });
});
