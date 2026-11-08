import { PROGRAM_SUBJECTS } from '../src/data/programSubjects';
import { getAllUndergraduatePrograms } from '../src/data/uniguajiraData';
import { programSubjects, searchSubjects, suggestSubjects } from '../src/lib/subjects';

describe('plan de referencia', () => {
  it('cada programa del catálogo tiene materias propias', () => {
    for (const program of getAllUndergraduatePrograms()) {
      expect(PROGRAM_SUBJECTS[program.id]?.subjects.length ?? 0).toBeGreaterThanOrEqual(7);
    }
  });

  it('los códigos usan el prefijo de la carrera y el semestre', () => {
    const anatomy = programSubjects('medicina').find((s) => s.name === 'Anatomía Humana I');
    expect(anatomy).toMatchObject({ code: 'MED-201', semester: 2, source: 'Medicina' });
  });
});

describe('suggestSubjects', () => {
  it('Medicina en 4.º semestre sugiere materias de Medicina, primero las de ese semestre', () => {
    const list = suggestSubjects(['Medicina'], [], 6, 4);
    expect(list.every((s) => s.source === 'Medicina')).toBe(true);
    expect(list.slice(0, 3).map((s) => s.semester)).toEqual([4, 4, 4]);
    expect(list.map((s) => s.name)).toContain('Fisiología');
  });

  it('después del semestre actual prefiere repasar el anterior antes que adelantar', () => {
    const list = suggestSubjects(['Medicina'], [], 6, 4);
    expect(list[3].semester).toBe(3);
  });

  it('omite las materias que ya existen', () => {
    const names = suggestSubjects(['Medicina'], ['fisiologia'], 20, 4).map((s) => s.name);
    expect(names).not.toContain('Fisiología');
  });

  it('con dos carreras intercala sus materias', () => {
    const sources = suggestSubjects(['Medicina', 'Ingeniería de Sistemas'], [], 4, 4).map((s) => s.source);
    expect(sources).toEqual(['Medicina', 'Ingeniería de Sistemas', 'Medicina', 'Ingeniería de Sistemas']);
  });

  it('una carrera fuera del catálogo recibe materias generales', () => {
    const list = suggestSubjects(['Astronomía'], [], 3);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((s) => s.semester === undefined)).toBe(true);
  });
});

describe('searchSubjects', () => {
  it('busca sin tildes y prioriza las materias de la carrera', () => {
    const list = searchSubjects('fisio', ['Medicina']);
    expect(list[0]).toMatchObject({ name: 'Fisiología', source: 'Medicina' });
  });

  it('también encuentra materias de otras carreras', () => {
    expect(searchSubjects('derecho romano', ['Medicina']).map((s) => s.name)).toContain('Derecho Romano');
  });

  it('las que empiezan igual van antes que las que solo contienen el texto', () => {
    const names = searchSubjects('anat', ['Medicina']).map((s) => s.name);
    expect(names[0].startsWith('Anat')).toBe(true);
  });

  it('sin texto no devuelve nada', () => {
    expect(searchSubjects('  ', ['Medicina'])).toEqual([]);
  });
});
