// Sin imports: este archivo también lo lee drizzle-kit (a través de schema.ts) con Node.

/**
 * Guía de estudio que acompaña al apunte. A diferencia del resumen, aquí la IA sí puede
 * aportar conocimiento que no está en el apunte, pero siempre en secciones marcadas como tal.
 */
export type StudyGuide = {
  /** El tema contado de forma sencilla, con un ejemplo. */
  explanation: string;
  /** Palabras y conceptos difíciles del apunte. */
  glossary: { term: string; meaning: string }[];
  /** Conocimiento que NO viene del apunte. */
  deeper: string[];
  /** Analogías y enfoques distintos para entender el tema. */
  alternatives: string[];
  /** Para qué le sirve el tema en su carrera (o carreras). */
  careerConnection: string;
  /** Pasos para estudiarlo, con minutos estimados. */
  studyPlan: { step: string; minutes: number }[];
  /** Qué repasar primero y en qué profundizar. */
  recommendations: string[];
};

export type StudyPack = {
  summary: string;
  keyConcepts: string[];
  flashcards: { question: string; answer: string }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  /** Solo la IA genera la guía; el generador local no. */
  guide?: StudyGuide | null;
};
