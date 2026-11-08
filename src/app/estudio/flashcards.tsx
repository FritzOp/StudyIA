import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { AnimatedEntrance, Fireworks, FlipCard, ProgressBar, RippleButton, SlidingNumber } from '@/components/motion';
import { Card, EmptyState, Screen } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { studyRepo } from '@/db/repositories/study';
import type { Flashcard } from '@/db/schema';
import { useFlashcards, useMaterials, useSubjects } from '@/hooks/useStudyData';
import { isDue } from '@/lib/study';

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => undefined);
};

/**
 * Sesión de repaso. Recibe uno de: materialId (un apunte), subjectId (una materia) o
 * due=1 (lo que toca hoy). Sin parámetros repasa todo.
 */
export default function FlashcardsScreen() {
  const params = useLocalSearchParams<{ materialId?: string; subjectId?: string; due?: string }>();
  const allCards = useFlashcards();
  const [session, setSession] = useState<Flashcard[] | null>(null);

  // La sesión se fija al empezar; si no, cada repaso cambiaría la lista mientras se estudia.
  if (!session && allCards.length > 0) {
    setSession(
      allCards.filter((card) => {
        if (params.materialId) return card.materialId === params.materialId;
        if (params.subjectId) return card.subjectId === params.subjectId;
        if (params.due) return isDue(card);
        return true;
      })
    );
  }

  if (!session || session.length === 0) {
    return (
      <Screen title="Flashcards" back>
        <EmptyState
          icon="cards-outline"
          title={params.due ? 'Nada por repasar hoy' : 'Sin flashcards'}
          message={params.due ? '¡Vas al día! Vuelve mañana.' : 'Procesa un apunte para generar tarjetas de estudio.'}
        />
      </Screen>
    );
  }

  return <Session cards={session} materialId={params.materialId} />;
}

function Session({ cards, materialId }: { cards: Flashcard[]; materialId?: string }) {
  const { theme } = useTheme();
  const userId = useUserId();
  const materials = useMaterials();
  const subjects = useSubjects();
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const current = queue[0];
  const reviewed = cards.length - queue.filter((c) => !retried.has(c.id)).length;

  const answer = async (knew: boolean) => {
    if (!current) return;
    haptic(knew ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    // Solo la primera respuesta cuenta para el sistema Leitner.
    const firstTime = !retried.has(current.id);
    if (firstTime) await studyRepo.reviewFlashcard(current, knew);
    if (firstTime && knew) setKnown((n) => n + 1);

    // La que no se sabía se repite una vez al final de la sesión.
    const shouldRetry = !knew && firstTime;
    const rest = queue.slice(1);
    const nextQueue = shouldRetry ? [...rest, current] : rest;
    if (shouldRetry) setRetried(new Set(retried).add(current.id));

    setFlipped(false);
    setQueue(nextQueue);

    if (nextQueue.length === 0) {
      setFinished(true);
      const material = materials.find((m) => m.id === (materialId ?? cards[0].materialId));
      const subject = subjects.find((s) => s.id === cards[0].subjectId);
      await studyRepo.logActivity({
        userId,
        type: 'flashcards',
        title: materialId && material ? material.title : 'Sesión de repaso',
        detail: `${known + (firstTime && knew ? 1 : 0)} de ${cards.length} flashcards recordadas.`,
        subjectName: subject?.name ?? '',
        materialId: materialId ?? null,
      });
    }
  };

  if (finished) {
    return (
      <Screen title="Flashcards" back>
        <AnimatedEntrance type="scale">
          <Card style={styles.result}>
            <Fireworks active={known / cards.length >= 0.6} />
            <MaterialCommunityIcons name="check-decagram" size={52} color={theme.success} />
            <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>¡Repaso terminado!</Text>
            <View style={styles.resultScore}>
              <SlidingNumber value={known} fontSize={32} color={theme.primary} />
              <Text style={[styles.resultOf, { color: theme.textSecondary }]}> de {cards.length} recordadas</Text>
            </View>
            <Text style={[styles.resultText, { color: theme.textMuted }]}>
              Las que recordaste volverán más adelante; las demás, mañana.
            </Text>
          </Card>
        </AnimatedEntrance>
        <RippleButton label="Volver" icon="arrow-left" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen title="Flashcards" subtitle={`${Math.min(reviewed + 1, cards.length)} de ${cards.length}`} back>
      <ProgressBar value={(reviewed / cards.length) * 100} color={theme.primary} trackColor={theme.surfaceElevated} />

      {retried.has(current.id) ? (
        <Text style={[styles.retryHint, { color: theme.warning }]}>Segunda oportunidad</Text>
      ) : null}

      <AnimatedEntrance key={`${current.id}-${queue.length}`} type="slideUp" duration={260}>
        <FlipCard
          flipped={flipped}
          onPress={() => setFlipped((v) => !v)}
          accessibilityLabel={flipped ? `Respuesta: ${current.answer}` : `Pregunta: ${current.question}`}
          front={
            <View style={[styles.face, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={[styles.faceTag, { color: theme.primary }]}>PREGUNTA</Text>
              <Text style={[styles.faceText, { color: theme.textPrimary }]}>{current.question}</Text>
              <View style={styles.hint}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={16} color={theme.textMuted} />
                <Text style={[styles.hintText, { color: theme.textMuted }]}>Toca para ver la respuesta</Text>
              </View>
            </View>
          }
          back={
            <View style={[styles.face, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
              <Text style={[styles.faceTag, { color: theme.onPrimary, opacity: 0.75 }]}>RESPUESTA</Text>
              <Text style={[styles.faceText, { color: theme.onPrimary }]}>{current.answer}</Text>
            </View>
          }
        />
      </AnimatedEntrance>

      {flipped ? (
        <AnimatedEntrance type="slideUp" duration={220}>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <RippleButton label="No la sabía" icon="close" variant="danger" onPress={() => answer(false)} />
            </View>
            <View style={styles.flex}>
              <RippleButton label="La sabía" icon="check" onPress={() => answer(true)} />
            </View>
          </View>
        </AnimatedEntrance>
      ) : (
        <RippleButton label="Ver respuesta" icon="eye-outline" variant="soft" onPress={() => setFlipped(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  retryHint: { fontSize: 12.5, fontWeight: '800', textAlign: 'center' },
  face: { borderWidth: 1, borderRadius: 22, padding: 22, minHeight: 280, justifyContent: 'center', gap: 14 },
  faceTag: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  faceText: { fontSize: 19, fontWeight: '700', lineHeight: 27, textAlign: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hintText: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  result: { alignItems: 'center', gap: 8, paddingVertical: 30, overflow: 'hidden' },
  resultTitle: { fontSize: 21, fontWeight: '800' },
  resultScore: { flexDirection: 'row', alignItems: 'center' },
  resultOf: { fontSize: 15, fontWeight: '600' },
  resultText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
