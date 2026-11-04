import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Accordion,
  AnimatedEntrance,
  AnimatedPressable,
  AnimatedPulse,
  RippleButton,
  ShimmeringText,
  SlidingNumber,
  TypingText,
} from '@/components/motion';
import { Banner, Card, Field, Screen, SectionTitle, type IconName } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import type { Material } from '@/db/schema';
import { useFlashcards, useMaterial, useQuizQuestions, useSubject, useAttempts } from '@/hooks/useStudyData';
import { confirmDeleteMaterial } from '@/lib/confirmations';
import { percentage } from '@/lib/study';
import { processMaterial } from '@/services/ai/pipeline';
import { explainWithAi } from '@/services/ai/remoteGenerator';

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const material = useMaterial(id);

  if (!material) return <Screen title="Apunte" back>{null}</Screen>;
  return <MaterialContent material={material} />;
}

function MaterialContent({ material }: { material: Material }) {
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const { isGuest } = useAuth();
  const subject = useSubject(material.subjectId);
  const allCards = useFlashcards();
  const allAttempts = useAttempts();
  const questions = useQuizQuestions(material.id);

  const cards = allCards.filter((c) => c.materialId === material.id);
  const attempts = allAttempts.filter((a) => a.materialId === material.id);
  const subjectName = subject?.name ?? 'Sin materia';

  const retry = () => {
    processMaterial(material.id, { canUseCloud, subjectName }).catch(() => undefined);
  };

  return (
    <Screen
      title={material.title}
      subtitle={subjectName}
      back
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Eliminar apunte"
          hitSlop={10}
          onPress={() => confirmDeleteMaterial(material, () => router.back())}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.error} />
        </Pressable>
      }
    >
      {material.status === 'processing' ? (
        <AnimatedEntrance type="scale">
          <Card style={styles.processing}>
            <AnimatedPulse>
              <View style={[styles.brain, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name="brain" size={40} color={theme.primary} />
              </View>
            </AnimatedPulse>
            <ShimmeringText
              text={canUseCloud ? 'Analizando tu apunte con IA' : 'Analizando tu apunte'}
              style={[styles.processingTitle, { color: theme.primary }]}
            />
            <Text style={[styles.processingText, { color: theme.textMuted }]}>
              Puedes salir de esta pantalla: seguirá procesándose.
            </Text>
          </Card>
        </AnimatedEntrance>
      ) : null}

      {material.status === 'pending' ? (
        <Banner
          tone="warning"
          icon="clock-outline"
          title="Pendiente de procesar"
          message={
            material.fileUri || material.sourceText
              ? (material.errorMessage ?? 'Se procesará cuando haya conexión.')
              : 'Se procesará en el teléfono donde se subió el archivo.'
          }
          action={canUseCloud && (material.fileUri || material.sourceText) ? <RetryLink onPress={retry} /> : undefined}
        />
      ) : null}

      {material.status === 'error' ? (
        <Banner
          tone="error"
          icon="alert-circle-outline"
          title="No se pudo procesar"
          message={material.errorMessage ?? 'Inténtalo de nuevo.'}
          action={material.fileUri || material.sourceText ? <RetryLink onPress={retry} /> : undefined}
        />
      ) : null}

      {material.status === 'ready' && material.generator === 'local' ? (
        <Banner
          tone="warning"
          icon="robot-off-outline"
          title="Generado sin IA"
          message={
            isGuest
              ? 'Se analizó en tu teléfono con frases de tu apunte. Crea una cuenta para usar la IA.'
              : canUseCloud
                ? 'Se analizó en tu teléfono con frases de tu apunte. Puedes mejorarlo ahora.'
                : 'Se analizó en tu teléfono con frases de tu apunte. Podrás mejorarlo con IA al tener conexión.'
          }
          action={canUseCloud ? <RetryLink label="Usar IA" onPress={retry} /> : undefined}
        />
      ) : null}

      {material.status === 'ready' ? (
        <>
          <View style={styles.study}>
            <StudyTile
              icon="cards-outline"
              color={theme.secondary}
              value={cards.length}
              label="Flashcards"
              disabled={cards.length === 0}
              onPress={() =>
                router.push({ pathname: '/estudio/flashcards', params: { materialId: material.id } })
              }
            />
            <StudyTile
              icon="help-circle-outline"
              color={theme.accentGreen}
              value={questions.length}
              label="Preguntas"
              disabled={questions.length === 0}
              onPress={() => router.push({ pathname: '/estudio/quiz', params: { materialId: material.id } })}
            />
          </View>

          {attempts.length > 0 ? (
            <Text style={[styles.lastScore, { color: theme.textSecondary }]}>
              Último quiz: {percentage(attempts[0].score, attempts[0].total)}% · {attempts.length}{' '}
              {attempts.length === 1 ? 'intento' : 'intentos'}
            </Text>
          ) : null}

          <AnimatedEntrance>
            <Card style={styles.summary}>
              <SectionTitle title="Resumen" />
              <Text selectable style={[styles.summaryText, { color: theme.textSecondary }]}>
                {material.summary}
              </Text>
            </Card>
          </AnimatedEntrance>

          {material.keyConcepts && material.keyConcepts.length > 0 ? (
            <Accordion title="Conceptos clave" icon="key-outline" defaultOpen>
              <View style={styles.concepts}>
                {material.keyConcepts.map((concept) => (
                  <View key={concept} style={[styles.concept, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.conceptText, { color: theme.primary }]}>{concept}</Text>
                  </View>
                ))}
              </View>
            </Accordion>
          ) : null}

          <Tutor material={material} />
        </>
      ) : null}

      {material.sourceText ? (
        <Accordion title="Apunte original" icon="text-long">
          <Text selectable style={[styles.source, { color: theme.textSecondary }]}>
            {material.sourceText}
          </Text>
        </Accordion>
      ) : null}

      {material.sourceType === 'image' && material.fileUri ? (
        <Accordion title="Foto original" icon="image-outline">
          <Image source={{ uri: material.fileUri }} style={styles.photo} resizeMode="contain" />
        </Accordion>
      ) : null}
    </Screen>
  );
}

function RetryLink({ label = 'Reintentar', onPress }: { label?: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Text style={[styles.retry, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

function StudyTile({
  icon,
  color,
  value,
  label,
  disabled,
  onPress,
}: {
  icon: IconName;
  color: string;
  value: number;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.tileWrap}>
      <AnimatedPressable
        accessibilityLabel={`${label}: ${value}`}
        disabled={disabled}
        onPress={onPress}
        style={[styles.tile, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
      >
        <View style={[styles.tileIcon, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <SlidingNumber value={value} fontSize={22} color={theme.textPrimary} />
        <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{label}</Text>
      </AnimatedPressable>
    </View>
  );
}

/** "Explicación de temas difíciles": preguntas libres con el apunte como contexto. */
function Tutor({ material }: { material: Material }) {
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) {
      setError('Escribe tu pregunta.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const context = [material.summary, material.sourceText].filter(Boolean).join('\n\n');
      setAnswer(await explainWithAi({ question: question.trim(), title: material.title, context }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener la explicación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion title="Pregúntale a StudyIA" icon="chat-question-outline">
      {canUseCloud ? (
        <View style={styles.tutor}>
          <Field
            label="¿Qué parte no entendiste?"
            placeholder="Ej. Explícame la diferencia con un ejemplo"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <RippleButton label="Explicar" icon="creation" variant="soft" loading={loading} onPress={ask} />
          {error ? <Banner tone="error" icon="alert-circle-outline" title={error} /> : null}
          {loading ? (
            <ShimmeringText text="Preparando la explicación" style={[styles.thinking, { color: theme.primary }]} />
          ) : null}
          {answer ? <TypingText key={answer} text={answer} style={[styles.answer, { color: theme.textSecondary }]} /> : null}
        </View>
      ) : (
        <Text style={[styles.source, { color: theme.textMuted }]}>
          El tutor usa IA en la nube: necesita conexión y una cuenta iniciada.
        </Text>
      )}
    </Accordion>
  );
}

const styles = StyleSheet.create({
  processing: { alignItems: 'center', gap: 12, paddingVertical: 26 },
  brain: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  processingTitle: { fontSize: 16, fontWeight: '800' },
  processingText: { fontSize: 12.5, textAlign: 'center' },
  retry: { fontSize: 13, fontWeight: '800', padding: 4 },
  study: { flexDirection: 'row', gap: 10 },
  tileWrap: { flex: 1 },
  tile: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 4 },
  tileIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  tileLabel: { fontSize: 12.5, fontWeight: '700' },
  lastScore: { fontSize: 12.5, textAlign: 'center' },
  summary: { gap: 8 },
  summaryText: { fontSize: 14.5, lineHeight: 22 },
  concepts: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  concept: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  conceptText: { fontSize: 12.5, fontWeight: '700' },
  source: { fontSize: 13.5, lineHeight: 20 },
  photo: { width: '100%', height: 320, borderRadius: 12 },
  tutor: { gap: 10 },
  thinking: { fontSize: 13.5, fontWeight: '700' },
  answer: { fontSize: 14, lineHeight: 21 },
});
