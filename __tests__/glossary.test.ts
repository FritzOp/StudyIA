import {
  containsTerm,
  definitionFromText,
  findTermRanges,
  sameTerm,
  splitByTerms,
  termContexts,
} from '../src/lib/glossary';

describe('splitByTerms', () => {
  it('marca el término sin importar mayúsculas', () => {
    expect(splitByTerms('El machine learning aprende.', ['Machine Learning'])).toEqual([
      { text: 'El ' },
      { text: 'machine learning', term: 'Machine Learning' },
      { text: ' aprende.' },
    ]);
  });

  it('solo encuentra palabras completas, pero acepta el plural', () => {
    expect(findTermRanges('Los modelos y el modelado', ['modelo']).map((r) => r.term)).toEqual(['modelo']);
    expect(containsTerm('Usa redes neuronales', 'red')).toBe(true);
    expect(containsTerm('Una reducción de datos', 'red')).toBe(false);
    expect(containsTerm('Varias capas ocultas', 'capa')).toBe(true);
  });

  it('prefiere el término más largo y no solapa', () => {
    const segments = splitByTerms('Una red neuronal profunda', ['red', 'red neuronal']);
    expect(segments.filter((s) => s.term).map((s) => s.text)).toEqual(['red neuronal']);
  });

  it('sin términos devuelve el texto intacto', () => {
    expect(splitByTerms('Hola', [])).toEqual([{ text: 'Hola' }]);
  });
});

describe('termContexts', () => {
  it('devuelve las frases donde aparece', () => {
    const text = 'La IA es amplia. El dataset entrena el modelo. Otro tema.\nUn dataset grande ayuda.';
    expect(termContexts(text, 'dataset')).toEqual(['El dataset entrena el modelo.', 'Un dataset grande ayuda.']);
  });
});

describe('sameTerm y definitionFromText', () => {
  it('reconoce el mismo término en singular o plural', () => {
    expect(sameTerm('Modelos', 'modelo')).toBe(true);
    expect(sameTerm('Capas', 'Datos')).toBe(false);
  });

  it('encuentra la frase que define el concepto', () => {
    const text = 'Se usan en traductores. Las redes neuronales son modelos inspirados en el cerebro. Otra frase.';
    expect(definitionFromText(text, 'Redes neuronales')).toBe(
      'Las redes neuronales son modelos inspirados en el cerebro.'
    );
    expect(definitionFromText(text, 'cerebro')).toBeNull();
  });
});
