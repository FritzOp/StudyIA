export const initialUser = {
  id: 'usr_001',
  name: 'Estudiante',
  email: 'estudiante@uniguajira.edu.co',
  role: 'Estudiante Universitario',
  institution: 'Universidad de La Guajira',
  career: 'Ingeniería de Sistemas',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  semester: '9no Semestre',
  studyStreakDays: 7,
};

export const initialSubjects = [
  {
    id: 'mat_001',
    name: 'Inteligencia Artificial',
    code: 'IA-401',
    description: 'Modelos de lenguaje, redes neuronales y machine learning.',
    color: '#6366F1', // Indigo
    icon: 'brain',
    notesCount: 12,
    progress: 75,
    lastActivity: 'Hoy, 10:30 AM',
  },
  {
    id: 'mat_002',
    name: 'Bases de Datos',
    code: 'BD-302',
    description: 'Modelado relacional, SQL, SQLite y optimización de consultas.',
    color: '#06B6D4', // Cyan
    icon: 'database',
    notesCount: 8,
    progress: 60,
    lastActivity: 'Ayer',
  },
  {
    id: 'mat_003',
    name: 'Desarrollo Móvil',
    code: 'DM-503',
    description: 'React Native, Expo Go, ciclo de vida de componentes y UX/UI.',
    color: '#10B981', // Emerald
    icon: 'cellphone',
    notesCount: 15,
    progress: 90,
    lastActivity: 'Hace 2 días',
  },
  {
    id: 'mat_004',
    name: 'Redes de Computadores',
    code: 'RC-304',
    description: 'Protocolos TCP/IP, sockets, arquitectura cliente-servidor.',
    color: '#F59E0B', // Amber
    icon: 'lan',
    notesCount: 6,
    progress: 45,
    lastActivity: 'Hace 3 días',
  },
];

export const initialActivities = [
  {
    id: 'act_001',
    type: 'summary',
    title: 'Resumen: Introducción a Redes Neuronales',
    subject: 'Inteligencia Artificial',
    time: 'Hace 2 horas',
    icon: 'text-box-check-outline',
    color: '#6366F1',
    snippet: 'La IA busca replicar habilidades cognitivas humanas mediante aprendizaje supervisado y profundo.',
  },
  {
    id: 'act_002',
    type: 'flashcard',
    title: 'Mazo: Álgebra Relacional y SQL',
    subject: 'Bases de Datos',
    time: 'Hace 5 horas',
    icon: 'cards-outline',
    color: '#06B6D4',
    snippet: '15 tarjetas memorizadas con 92% de efectividad.',
  },
  {
    id: 'act_003',
    type: 'quiz',
    title: 'Quiz Rápido: Fundamentos Móviles',
    subject: 'Desarrollo Móvil',
    time: 'Ayer',
    icon: 'checkbox-marked-circle-outline',
    color: '#10B981',
    score: '9/10 (90%)',
    snippet: 'Excelente comprensión de componentes y ciclo de renderizado.',
  },
];

export const studyStats = {
  totalNotes: 41,
  summariesGenerated: 28,
  flashcardsLearned: 154,
  quizzesTaken: 19,
  averageScore: 88,
  streak: 7,
};
