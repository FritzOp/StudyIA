import React, { useMemo, useState } from 'react';
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
import { GlossaryText } from '@/components/GlossaryText';
import { StudyGuideView } from '@/components/StudyGuide';
import { Banner, Card, Field, Screen, SectionTitle, type IconName } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import type { Material } from '@/db/schema';
import {
  useAttempts,
  useFlashcards,
  useMaterial,
  useProfile,
  useQuizQuestions,
  useSubject,
} from '@/hooks/useStudyData';
import { activeCareers } from '@/lib/careers';
import { highlightTerms } from '@/lib/glossary';
import { confirmDeleteMaterial } from '@/lib/confirmations';
import { percentage } from '@/lib/study';
import { generateGuide, processMaterial } from '@/services/ai/pipeline';
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
  // Los términos del glosario se resaltan en todo el apunte y se pueden tocar.
  const terms = useMemo(() => highlightTerms(material), [material]);

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
              text={canUseCloud ? 'StudyIA está analizando tu apunte' : 'Analizando tu apunte'}
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
              ? 'Se analizó en tu teléfono con frases de tu apunte. Crea una cuenta para que StudyIA lo analice a fondo.'
              : canUseCloud
                ? 'Se analizó en tu teléfono con frases de tu apunte. Deja que StudyIA lo mejore y prepare tu guía de estudio.'
                : 'Se analizó en tu teléfono con frases de tu apunte. Con conexión, StudyIA podrá mejorarlo y preparar tu guía de estudio.'
          }
          action={canUseCloud ? <RetryLink label="Mejorar con StudyIA" onPress={retry} /> : undefined}
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
              <GlossaryText
                text={material.summary ?? ''}
                terms={terms}
                materialId={material.id}
                style={[styles.summaryText, { color: theme.textSecondary }]}
              />
              {terms.length > 0 ? (
                <Text style={[styles.hint, { color: theme.textMuted }]}>
                  Toca una palabra subrayada para ver su significado.
                </Text>
              ) : null}
            </Card>
          </AnimatedEntrance>

          {material.keyConcepts && material.keyConcepts.length > 0 ? (
            <Accordion title="Conceptos clave" icon="key-outline" defaultOpen>
              <View style={styles.concepts}>
                {material.keyConcepts.map((concept) => (
                  <Pressable
                    key={concept}
                    accessibilityRole="link"
                    accessibilityHint="Abre el significado y el contexto de este concepto"
                    onPress={() =>
                      router.push({ pathname: '/termino', params: { materialId: material.id, term: concept } })
                    }
                    style={({ pressed }) => [
                      styles.concept,
                      { backgroundColor: theme.primaryLight, opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Text style={[styles.conceptText, { color: theme.primary }]}>{concept}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.hint, styles.conceptsHint, { color: theme.textMuted }]}>
                Toca un concepto para ver qué significa en este tema.
              </Text>
            </Accordion>
          ) : null}

          <GuideSection material={material} subjectName={subjectName} onUseAi={retry} terms={terms} />

          <Tutor material={material} />
        </>
      ) : null}

      {material.sourceText ? (
        <Accordion title="Apunte original" icon="text-long">
          <GlossaryText
            text={material.sourceText}
            terms={terms}
            materialId={material.id}
            style={[styles.source, { color: theme.textSecondary }]}
          />
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

/** Guía de estudio de la IA, o la forma de obtenerla si el apunte todavía no la tiene. */
function GuideSection({
  material,
  subjectName,
  onUseAi,
  terms,
}: {
  material: Material;
  subjectName: string;
  onUseAi: () => void;
  terms: string[];
}) {
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const careers = activeCareers(useProfile());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateGuide(material, subjectName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo preparar la guía.');
    } finally {
      setLoading(false);
    }
  };

  const isLocal = material.generator === 'local';

  return (
    <View style={styles.guide}>
      <SectionTitle
        title="Guía de estudio"
        subtitle={material.guide ? 'Preparada por StudyIA para ti' : undefined}
        right={
          material.guide && canUseCloud ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Actualizar la guía con mis carreras actuales"
              hitSlop={8}
              disabled={loading}
              onPress={create}
            >
              <Text style={[styles.retry, { color: theme.primary }]}>{loading ? 'Actualizando…' : 'Actualizar'}</Text>
            </Pressable>
          ) : undefined
        }
      />
      {error ? <Banner tone="error" icon="alert-circle-outline" title={error} /> : null}

      {material.guide ? (
        <StudyGuideView guide={material.guide} careers={careers} materialId={material.id} terms={terms} />
      ) : (
        <Card style={styles.guideEmpty}>
          <MaterialCommunityIcons name="map-marker-path" size={30} color={theme.primary} />
          <Text style={[styles.guideEmptyText, { color: theme.textSecondary }]}>
            Explicación sencilla, glosario de palabras difíciles, plan de estudio, otras formas de entender el
            tema y para qué te sirve en tu carrera.
          </Text>
          {canUseCloud ? (
            <RippleButton
              label={isLocal ? 'Mejorar con StudyIA' : 'Generar guía de estudio'}
              icon="creation"
              variant="soft"
              loading={loading}
              onPress={isLocal ? onUseAi : create}
            />
          ) : (
            <Text style={[styles.guideEmptyHint, { color: theme.textMuted }]}>
              StudyIA prepara la guía en la nube: necesita conexión y una cuenta iniciada.
            </Text>
          )}
          {loading ? (
            <ShimmeringText text="Preparando tu guía" style={[styles.thinking, { color: theme.primary }]} />
          ) : null}
        </Card>
      )}
    </View>
  );
}

/** "Explicación de temas difíciles": preguntas libres con el apunte como contexto. */
function Tutor({ material }: { material: Material }) {
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const profile = useProfile();
  const careers = activeCareers(profile);
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
      setAnswer(await explainWithAi({ question: question.trim(), title: material.title, context, careers, semester: profile?.semester }));
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
          El tutor de StudyIA funciona en la nube: necesita conexión y una cuenta iniciada.
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
  hint: { fontSize: 12, fontStyle: 'italic' },
  conceptsHint: { marginTop: 10 },
  concepts: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  concept: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  conceptText: { fontSize: 12.5, fontWeight: '700' },
  source: { fontSize: 13.5, lineHeight: 20 },
  photo: { width: '100%', height: 320, borderRadius: 12 },
  tutor: { gap: 10 },
  guide: { gap: 12 },
  guideEmpty: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  guideEmptyText: { fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  guideEmptyHint: { fontSize: 12.5, textAlign: 'center' },
  thinking: { fontSize: 13.5, fontWeight: '700' },
  answer: { fontSize: 14, lineHeight: 21 },
});
