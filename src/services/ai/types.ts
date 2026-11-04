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
};
