import {
  averageScore,
  comprehension,
  computeStreak,
  initialsOf,
  isPending,
  MASTERED_BOX,
  countLabel,
  isDue,
  nextReview,
  percentage,
  shuffle,
  timeAgo,
} from '../src/lib/study';

const DAY = 24 * 60 * 60 * 1000;

describe('isPending', () => {
  const updatedAt = new Date(2000);

  it('está pendiente si nunca se subió', () => {
    expect(isPending({ syncedAt: null, updatedAt })).toBe(true);
  });
  it('está pendiente si cambió después de subirse', () => {
    expect(isPending({ syncedAt: new Date(1000), updatedAt })).toBe(true);
  });
  it('no está pendiente si la versión en la nube es la actual', () => {
    expect(isPending({ syncedAt: new Date(2000), updatedAt })).toBe(false);
  });
});

describe('nextReview (Leitner)', () => {
  const now = new Date('2026-11-04T12:00:00');

  it('sube de caja y espacia el repaso si la sabía', () => {
    const result = nextReview({ box: 2, dueAt: now }, true, now);
    expect(result.box).toBe(3);
    expect(result.dueAt.getTime()).toBe(now.getTime() + 7 * DAY);
  });
  it('vuelve a la caja 1 y se repasa mañana si no la sabía', () => {
    const result = nextReview({ box: 4, dueAt: now }, false, now);
    expect(result.box).toBe(1);
    expect(result.dueAt.getTime()).toBe(now.getTime() + DAY);
  });
  it('no pasa de la caja máxima', () => {
    expect(nextReview({ box: 5, dueAt: now }, true, now).box).toBe(5);
  });
  it('repetirla el mismo día no la sube: cuatro aciertos seguidos cuentan como uno', () => {
    let card = { box: 1, dueAt: now };
    for (let i = 0; i < 4; i++) card = nextReview(card, true, now);
    expect(card.box).toBe(2);
    expect(card.dueAt.getTime()).toBe(now.getTime() + 3 * DAY);
  });
  it('si la falla en práctica libre, sí vuelve a la caja 1', () => {
    const result = nextReview({ box: 3, dueAt: new Date(now.getTime() + 5 * DAY) }, false, now);
    expect(result).toEqual({ box: 1, dueAt: new Date(now.getTime() + DAY) });
  });
});

describe('isDue', () => {
  const studied = new Date('2026-11-04T20:00:00');

  it('cuenta el día y no la hora: lo estudiado a las 8 p. m. toca desde la mañana siguiente', () => {
    const card = nextReview({ box: 3, dueAt: studied }, false, studied);
    expect(isDue(card, new Date('2026-11-04T23:59:00'))).toBe(false);
    expect(isDue(card, new Date('2026-11-05T07:00:00'))).toBe(true);
  });
  it('sigue pendiente si se pasó el día', () => {
    expect(isDue({ dueAt: studied }, new Date('2026-11-09T08:00:00'))).toBe(true);
  });
});

describe('shuffle', () => {
  it('conserva todas las tarjetas y no modifica la lista original', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = shuffle(items);
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('cambia el orden según el azar', () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});

describe('countLabel', () => {
  it('usa singular solo con 1', () => {
    expect(countLabel(1, 'flashcard')).toBe('1 flashcard');
    expect(countLabel(0, 'flashcard')).toBe('0 flashcards');
    expect(countLabel(8, 'flashcard')).toBe('8 flashcards');
  });
});

describe('computeStreak', () => {
  const now = new Date('2026-11-04T20:00:00');
  const daysAgo = (n: number) => new Date(now.getTime() - n * DAY);

  it('es 0 sin actividad', () => {
    expect(computeStreak([], now)).toBe(0);
  });
  it('cuenta días consecutivos terminando hoy', () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)], now)).toBe(3);
  });
  it('sigue viva si estudió ayer pero aún no hoy', () => {
    expect(computeStreak([daysAgo(1), daysAgo(2)], now)).toBe(2);
  });
  it('se rompe tras un día completo sin estudiar', () => {
    expect(computeStreak([daysAgo(2), daysAgo(3)], now)).toBe(0);
  });
  it('varias actividades el mismo día cuentan una sola vez', () => {
    expect(computeStreak([daysAgo(0), daysAgo(0), daysAgo(1)], now)).toBe(2);
  });
});

describe('puntajes', () => {
  it('percentage no divide por cero', () => {
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(3, 4)).toBe(75);
  });
  it('averageScore promedia los porcentajes de cada intento', () => {
    expect(averageScore([{ score: 1, total: 2 }, { score: 4, total: 4 }])).toBe(75);
    expect(averageScore([])).toBe(0);
  });
});

describe('comprehension', () => {
  const unseen = { box: 1, reviewCount: 0 };
  const mastered = { box: MASTERED_BOX, reviewCount: 3 };
  const reviewed = { box: 2, reviewCount: 1 };

  it('es 0 sin ninguna práctica', () => {
    expect(comprehension([unseen, unseen], [])).toBe(0);
  });
  it('las tarjetas sin repasar no bajan el puntaje de quiz', () => {
    expect(comprehension([unseen, unseen], [{ score: 8, total: 10 }])).toBe(80);
  });
  it('promedia el dominio de tarjetas con los quizzes', () => {
    expect(comprehension([mastered, mastered], [{ score: 5, total: 10 }])).toBe(75);
  });
  it('el dominio avanza con cada caja, no solo al llegar a la última', () => {
    // Caja 2 = un tercio del camino; caja de dominio = completo.
    expect(comprehension([reviewed], [])).toBe(33);
    expect(comprehension([mastered, reviewed], [])).toBe(67);
  });
});

describe('utilidades de texto', () => {
  it('initialsOf toma hasta dos iniciales', () => {
    expect(initialsOf('ana maría lópez')).toBe('AM');
    expect(initialsOf('Ana')).toBe('A');
    expect(initialsOf('')).toBe('E');
  });
  it('timeAgo redacta en español', () => {
    const now = new Date('2026-11-04T12:00:00');
    expect(timeAgo(now, now)).toBe('Justo ahora');
    expect(timeAgo(new Date(now.getTime() - 5 * 60000), now)).toBe('Hace 5 min');
    expect(timeAgo(new Date(now.getTime() - DAY), now)).toBe('Ayer');
  });
});
