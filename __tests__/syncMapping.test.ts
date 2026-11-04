import { describeSync, fromRemote, remoteWins, toRemote, type SyncFields } from '../src/services/sync/mapping';

const CARDS: SyncFields = {
  fields: { materialId: 'material_id', question: 'question', dueAt: 'due_at', lastReviewedAt: 'last_reviewed_at' },
  dates: ['dueAt', 'lastReviewedAt'],
};
const MATERIALS: SyncFields = { fields: { title: 'title', status: 'status' }, hasStatus: true };

const base = {
  id: 'abc',
  createdAt: new Date('2026-11-01T10:00:00.000Z'),
  updatedAt: new Date('2026-11-02T10:00:00.000Z'),
  deletedAt: null,
};

describe('toRemote', () => {
  it('convierte a snake_case, fechas a ISO y fija el usuario de la sesión', () => {
    const row = toRemote(
      CARDS,
      { ...base, userId: 'otro', materialId: 'm1', question: '¿Qué?', dueAt: new Date('2026-11-03T00:00:00.000Z'), lastReviewedAt: null },
      'usuario-1'
    );
    expect(row).toEqual({
      id: 'abc',
      user_id: 'usuario-1',
      created_at: '2026-11-01T10:00:00.000Z',
      updated_at: '2026-11-02T10:00:00.000Z',
      deleted_at: null,
      material_id: 'm1',
      question: '¿Qué?',
      due_at: '2026-11-03T00:00:00.000Z',
      last_reviewed_at: null,
    });
  });

  it('propaga el borrado lógico', () => {
    const deletedAt = new Date('2026-11-04T00:00:00.000Z');
    expect(toRemote(MATERIALS, { ...base, deletedAt, title: 'x', status: 'ready' }, 'u').deleted_at).toBe(
      '2026-11-04T00:00:00.000Z'
    );
  });

  it('no sube el estado transitorio "processing"', () => {
    expect(toRemote(MATERIALS, { ...base, title: 'x', status: 'processing' }, 'u').status).toBe('pending');
  });

  it('no incluye columnas locales como la ruta del archivo', () => {
    const row = toRemote(MATERIALS, { ...base, title: 'x', status: 'ready', fileUri: 'file:///foto.jpg' }, 'u');
    expect(row).not.toHaveProperty('fileUri');
    expect(row).not.toHaveProperty('file_uri');
  });
});

describe('fromRemote', () => {
  it('es la operación inversa de toRemote', () => {
    const local = {
      ...base,
      materialId: 'm1',
      question: '¿Qué?',
      dueAt: new Date('2026-11-03T00:00:00.000Z'),
      lastReviewedAt: null,
    };
    expect(fromRemote(CARDS, toRemote(CARDS, local, 'u'))).toEqual({ ...local, userId: 'u' });
  });
});

describe('remoteWins (gana el último cambio)', () => {
  const older = new Date(1000);
  const newer = new Date(2000);

  it('gana si no existe en local', () => expect(remoteWins(older, undefined)).toBe(true));
  it('gana si es más reciente', () => expect(remoteWins(newer, older)).toBe(true));
  it('pierde si es más antiguo', () => expect(remoteWins(older, newer)).toBe(false));
  it('no reescribe si son iguales', () => expect(remoteWins(older, older)).toBe(false));
});

describe('describeSync', () => {
  it('redacta el resultado', () => {
    expect(describeSync({ uploaded: 0, downloaded: 0 })).toBe('Todo está al día.');
    expect(describeSync({ uploaded: 2, downloaded: 1 })).toBe('2 subidos, 1 bajado');
  });
});
