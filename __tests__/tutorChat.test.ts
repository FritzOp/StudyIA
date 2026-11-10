import { filesToSend, fitToBudget, historyToSend, questionText, type ChatMessage } from '../src/lib/tutorChat';

const photo = { fileUri: 'file:///foto.jpg', mimeType: 'image/jpeg' };
const msg = (role: 'user' | 'assistant', text: string, names: string[] = []): ChatMessage => ({
  role,
  text,
  attachments: names.map((name) => ({ uri: `file:///${name}`, name, mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' })),
});

describe('filesToSend', () => {
  it('siempre incluye la foto original del apunte primero', () => {
    const files = filesToSend(photo, []);
    expect(files).toEqual([{ uri: 'file:///foto.jpg', mimeType: 'image/jpeg', label: 'Foto original del apunte' }]);
  });

  it('agrega los adjuntos más recientes sin pasar del máximo', () => {
    const messages = [msg('user', 'a', ['1.jpg', '2.jpg']), msg('assistant', 'ok'), msg('user', 'b', ['3.pdf'])];
    const files = filesToSend(photo, messages, 3);
    expect(files.map((f) => f.uri)).toEqual(['file:///foto.jpg', 'file:///3.pdf', 'file:///2.jpg']);
  });

  it('un apunte de texto no aporta archivo propio', () => {
    expect(filesToSend({ fileUri: null, mimeType: null }, [msg('user', 'x', ['1.jpg'])]).map((f) => f.uri)).toEqual([
      'file:///1.jpg',
    ]);
  });
});

describe('historyToSend', () => {
  it('menciona los adjuntos y conserva los últimos mensajes', () => {
    const history = historyToSend([msg('user', 'viejo'), msg('user', 'mira', ['ej.jpg']), msg('assistant', 'listo')], 2);
    expect(history).toEqual([
      { role: 'user', text: 'mira\n[Adjuntó: ej.jpg]' },
      { role: 'assistant', text: 'listo' },
    ]);
  });
});

describe('questionText y fitToBudget', () => {
  it('pone una pregunta por defecto si solo hay adjuntos', () => {
    expect(questionText('  ', msg('user', '', ['a.jpg']).attachments)).toBe('Revisa el archivo que adjunté y explícamelo.');
    expect(questionText('  ', [])).toBe('');
  });

  it('descarta los archivos que no caben en el límite', () => {
    const files = [{ base64: 'aaaa' }, { base64: 'bbbbbb' }, { base64: 'cc' }];
    expect(fitToBudget(files, 7).map((f) => f.base64)).toEqual(['aaaa', 'cc']);
  });
});
