import { useState, useCallback } from 'react';
import { initialActivities, studyStats } from '../data/mockData';

export function useStudyMaterials() {
  const [activities, setActivities] = useState(initialActivities);
  const [stats, setStats] = useState(studyStats);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const synthesizeMaterial = useCallback(async ({ subject, sourceUri, sourceType }) => {
    setIsSynthesizing(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const newSummary = {
          id: `act_${Date.now()}`,
          type: 'summary',
          title: `Apunte Escaneado: ${subject}`,
          subject,
          time: 'Justo ahora',
          icon: 'text-box-check-outline',
          color: '#6366F1',
          snippet:
            'Información analizada y sintetizada con IA. Se extrajeron los conceptos fundamentales y se estructuraron flashcards para repaso.',
        };

        setActivities((prev) => [newSummary, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalNotes: prev.totalNotes + 1,
          summariesGenerated: prev.summariesGenerated + 1,
          flashcardsLearned: prev.flashcardsLearned + 4,
        }));

        setIsSynthesizing(false);
        resolve({
          title: `Síntesis de ${subject}`,
          summary:
            'La síntesis automática procesó los apuntes cargados, extrayendo definiciones, términos clave y preguntas evaluativas para optimizar tu tiempo de estudio.',
          flashcards: [
            {
              q: 'Concepto Principal',
              a: 'Definición clave extraída del apunte procesado mediante el modelo de lenguaje.',
            },
            {
              q: 'Aplicación Práctica',
              a: 'Casos de uso y resolución de problemas según el temario de la asignatura.',
            },
          ],
        });
      }, 2000);
    });
  }, []);

  return {
    activities,
    stats,
    isSynthesizing,
    synthesizeMaterial,
  };
}
