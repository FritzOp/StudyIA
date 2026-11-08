import {
  describeReminderDate,
  formatHour,
  nextReminderDate,
  planReminder,
  quizTrend,
  weeklyActivity,
} from '../src/lib/progress';

const at = (d: string) => new Date(d);

describe('weeklyActivity', () => {
  const now = at('2026-11-08T15:00:00'); // domingo

  it('devuelve 7 días en orden, terminando hoy', () => {
    const week = weeklyActivity([], now);
    expect(week.map((d) => d.label)).toEqual(['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'hoy']);
    expect(week[0].longLabel).toBe('lunes 2 nov');
    expect(week.every((d) => d.total === 0)).toBe(true);
  });

  it('cuenta por día y por tipo, e ignora lo que queda fuera de la semana', () => {
    const week = weeklyActivity(
      [
        { createdAt: at('2026-11-08T08:00:00'), type: 'quiz' },
        { createdAt: at('2026-11-08T09:00:00'), type: 'flashcards' },
        { createdAt: at('2026-11-05T22:00:00'), type: 'material' },
        { createdAt: at('2026-10-20T10:00:00'), type: 'quiz' },
      ],
      now
    );
    expect(week[6].total).toBe(2);
    expect(week[6].byType).toEqual({ material: 0, flashcards: 1, quiz: 1 });
    expect(week[3].total).toBe(1);
    expect(week.reduce((sum, d) => sum + d.total, 0)).toBe(3);
  });
});

describe('quizTrend', () => {
  it('ordena cronológicamente, convierte a porcentaje y deja los últimos N', () => {
    const attempts = [
      { createdAt: at('2026-11-07T10:00:00'), score: 4, total: 5, materialId: 'b' },
      { createdAt: at('2026-11-01T10:00:00'), score: 1, total: 4, materialId: 'a' },
      { createdAt: at('2026-11-03T10:00:00'), score: 3, total: 4, materialId: 'a' },
    ];
    const trend = quizTrend(attempts, (id) => (id === 'a' ? 'Redes' : 'SQL'), 2);
    expect(trend.map((p) => p.score)).toEqual([75, 80]);
    expect(trend.map((p) => p.title)).toEqual(['Redes', 'SQL']);
    expect(trend[1].label).toBe('7 nov');
  });
});

describe('recordatorios', () => {
  const now = at('2026-11-08T10:00:00');

  it('programa hoy si la hora no ha pasado y mañana si ya pasó', () => {
    expect(nextReminderDate(now, 19).getTime()).toBe(at('2026-11-08T19:00:00').getTime());
    expect(nextReminderDate(now, 7).getTime()).toBe(at('2026-11-09T07:00:00').getTime());
    expect(nextReminderDate(at('2026-11-08T19:00:00'), 19).getTime()).toBe(at('2026-11-09T19:00:00').getTime());
  });

  it('cuenta las flashcards que estarán vencidas a la hora del aviso', () => {
    const plan = planReminder({
      now,
      hour: 19,
      cards: [
        { dueAt: at('2026-11-08T09:00:00') },
        { dueAt: at('2026-11-08T18:00:00') },
        { dueAt: at('2026-11-09T09:00:00') },
      ],
      activityDates: [at('2026-11-07T20:00:00')],
    });
    expect(plan?.dueCount).toBe(2);
    expect(plan?.title).toBe('Hora de repasar');
    expect(plan?.body).toBe('2 flashcards te esperan. Mantén tu racha de 1 día.');
  });

  it('sin flashcards, solo avisa de la racha si ese día aún no se estudió', () => {
    const streak = planReminder({ now, hour: 19, cards: [], activityDates: [at('2026-11-07T20:00:00')] });
    expect(streak?.title).toBe('No pierdas tu racha');

    const alreadyStudied = planReminder({
      now,
      hour: 19,
      cards: [],
      activityDates: [at('2026-11-07T20:00:00'), at('2026-11-08T09:00:00')],
    });
    expect(alreadyStudied).toBeNull();
  });

  it('no avisa si no hay nada pendiente ni racha', () => {
    expect(planReminder({ now, hour: 19, cards: [], activityDates: [] })).toBeNull();
  });

  it('formatea la hora en español', () => {
    expect(formatHour(7)).toBe('7:00 a. m.');
    expect(formatHour(12)).toBe('12:00 p. m.');
    expect(formatHour(0)).toBe('12:00 a. m.');
    expect(formatHour(19, 30)).toBe('7:30 p. m.');
    expect(describeReminderDate(at('2026-11-09T07:00:00'), now)).toBe('mañana 7:00 a. m.');
  });
});
