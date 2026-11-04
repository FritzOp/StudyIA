import { generateLocally, splitSentences, TextTooShortError } from '../src/services/ai/localGenerator';

const NOTE = `La inteligencia artificial es un área de la informática que busca desarrollar sistemas capaces de realizar tareas asociadas tradicionalmente con la inteligencia humana.

Machine Learning es una rama de la inteligencia artificial que permite a los sistemas aprender patrones a partir de datos, sin programar cada regla de forma explícita.

Las redes neuronales son modelos inspirados en el cerebro, formados por capas de neuronas artificiales que transforman los datos de entrada. El aprendizaje profundo utiliza redes neuronales con muchas capas para resolver problemas complejos como la visión artificial.

El procesamiento del lenguaje natural es la disciplina que permite a las máquinas comprender y generar lenguaje humano. Los modelos de lenguaje aprenden a partir de grandes cantidades de texto y se usan en traductores y asistentes.`;

describe('splitSentences', () => {
  it('separa por puntuación y saltos de línea y descarta fragmentos', () => {
    expect(splitSentences('Primera frase de prueba aquí. Segunda frase de prueba aquí.\nHola.')).toEqual([
      'Primera frase de prueba aquí.',
      'Segunda frase de prueba aquí.',
    ]);
  });
  it('quita viñetas y numeración del inicio', () => {
    expect(splitSentences('- Una idea con viñeta incluida\n2) Otra idea con número incluido')).toEqual([
      'Una idea con viñeta incluida',
      'Otra idea con número incluido',
    ]);
  });
});

describe('generateLocally', () => {
  const pack = generateLocally(NOTE);

  it('rechaza textos demasiado cortos en lugar de inventar contenido', () => {
    expect(() => generateLocally('Hola mundo.')).toThrow(TextTooShortError);
  });

  it('el resumen solo contiene frases del apunte', () => {
    expect(pack.summary.length).toBeGreaterThan(0);
    for (const sentence of splitSentences(pack.summary)) {
      expect(NOTE).toContain(sentence);
    }
  });

  it('detecta los términos definidos como conceptos', () => {
    expect(pack.keyConcepts).toEqual(expect.arrayContaining(['Inteligencia artificial', 'Machine Learning']));
  });

  it('convierte definiciones en flashcards con el verbo correcto', () => {
    const questions = pack.flashcards.map((f) => f.question);
    expect(questions).toContain('¿Qué es Machine Learning?');
    expect(questions).toContain('¿Qué son redes neuronales?');
    const ml = pack.flashcards.find((f) => f.question === '¿Qué es Machine Learning?');
    expect(ml?.answer).toMatch(/^Una rama de la inteligencia artificial/);
  });

  it('cada pregunta del quiz es válida: 4 opciones únicas y el índice apunta a la respuesta', () => {
    expect(pack.quiz.length).toBeGreaterThan(0);
    for (const q of pack.quiz) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      // La respuesta correcta debe estar en la frase original y no en la pregunta.
      expect(q.explanation.toLowerCase()).toContain(q.options[q.correctIndex].toLowerCase());
      expect(q.question).toContain('_____');
    }
  });

  it('es determinista: el mismo apunte da el mismo material', () => {
    expect(generateLocally(NOTE)).toEqual(pack);
  });
});
