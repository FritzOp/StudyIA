import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AnimatedCheck,
  AnimatedEntrance,
  Fireworks,
  ProgressBar,
  ProgressRing,
  RippleButton,
  SlidingNumber,
} from '@/components/motion';
import { Card, EmptyState, Screen } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { studyRepo } from '@/db/repositories/study';
import { useMaterial, useQuizQuestions, useSubject } from '@/hooks/useStudyData';
import { percentage } from '@/lib/study';

const PASSING = 60;

const notify = (type: Haptics.NotificationFeedbackType) => {
  if (Platform.OS !== 'web') Haptics.notificationAsync(type).catch(() => undefined);
};

export default function QuizScreen() {
  const { materialId } = useLocalSearchParams<{ materialId: string }>();
  const { theme } = useTheme();
  const userId = useUserId();
  const material = useMaterial(materialId);
  const subject = useSubject(material?.subjectId ?? '');
  const questions = useQuizQuestions(materialId);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  if (!material || questions.length === 0) {
    return (
      <Screen title="Quiz" back>
        <EmptyState
          icon="help-circle-outline"
          title="Este apunte no tiene quiz"
          message="El texto no alcanzó para generar preguntas. Prueba con un apunte más completo o procésalo con IA."
        />
      </Screen>
    );
  }

  const question = questions[index];
  const score = answers.filter((answer, i) => answer === questions[i].correctIndex).length;

  const check = () => {
    if (selected === null) return;
    setSubmitted(true);
    setAnswers((list) => [...list, selected]);
    notify(
      selected === question.correctIndex
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const next = async () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setSubmitted(false);
      return;
    }
    setFinished(true);
    await studyRepo.saveAttempt({
      userId,
      materialId: material.id,
      subjectId: material.subjectId,
      score,
      total: questions.length,
      answers,
    });
    await studyRepo.logActivity({
      userId,
      type: 'quiz',
      title: material.title,
      detail: `Quiz: ${score}/${questions.length} (${percentage(score, questions.length)}%).`,
      subjectName: subject?.name ?? '',
      materialId: material.id,
    });
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const result = percentage(score, questions.length);
    const passed = result >= PASSING;
    return (
      <Screen title="Resultado" subtitle={material.title} back>
        <AnimatedEntrance type="scale">
          <Card style={styles.result}>
            <Fireworks active={passed} />
            <ProgressRing
              value={result}
              size={140}
              color={passed ? theme.success : theme.error}
              trackColor={theme.surfaceElevated}
            >
              <SlidingNumber value={result} suffix="%" fontSize={30} color={theme.textPrimary} />
            </ProgressRing>
            <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>
              {result === 100 ? '¡Perfecto!' : passed ? '¡Buen trabajo!' : 'Sigue practicando'}
            </Text>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>
              {score} de {questions.length} respuestas correctas
            </Text>
          </Card>
        </AnimatedEntrance>
        <RippleButton label="Intentar de nuevo" icon="refresh" variant="soft" onPress={restart} />
        <RippleButton label="Volver al apunte" icon="arrow-left" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isCorrect = selected === question.correctIndex;

  return (
    <Screen title="Quiz" subtitle={`Pregunta ${index + 1} de ${questions.length}`} back>
      <ProgressBar
        value={((index + (submitted ? 1 : 0)) / questions.length) * 100}
        color={theme.primary}
        trackColor={theme.surfaceElevated}
      />

      <AnimatedEntrance key={question.id} type="slideUp" duration={280} style={styles.question}>
        <Card>
          <Text style={[styles.questionText, { color: theme.textPrimary }]}>{question.question}</Text>
        </Card>

        <View style={styles.options}>
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isAnswer = i === question.correctIndex;
            const state = submitted
              ? isAnswer
                ? 'correct'
                : isSelected
                  ? 'wrong'
                  : 'none'
              : isSelected
                ? 'selected'
                : 'none';
            const accent =
              state === 'correct' ? theme.success : state === 'wrong' ? theme.error : theme.primary;
            return (
              <AnimatedEntrance key={`${question.id}-${i}`} delay={i * 50} duration={260}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, disabled: submitted }}
                  disabled={submitted}
                  onPress={() => setSelected(i)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: state === 'none' ? theme.cardBg : `${accent}18`,
                      borderColor: state === 'none' ? theme.border : accent,
                    },
                  ]}
                >
                  <AnimatedCheck state={state} color={accent} />
                  <Text style={[styles.optionText, { color: theme.textPrimary }]}>{option}</Text>
                </Pressable>
              </AnimatedEntrance>
            );
          })}
        </View>
      </AnimatedEntrance>

      {submitted ? (
        <AnimatedEntrance duration={280}>
          <Card style={styles.feedback}>
            <View style={styles.feedbackTitle}>
              <MaterialCommunityIcons
                name={isCorrect ? 'check-decagram' : 'alert-circle'}
                size={22}
                color={isCorrect ? theme.success : theme.error}
              />
              <Text style={[styles.feedbackHeading, { color: isCorrect ? theme.success : theme.error }]}>
                {isCorrect ? '¡Correcto!' : 'No es correcta'}
              </Text>
            </View>
            {question.explanation ? (
              <Text style={[styles.explanation, { color: theme.textSecondary }]}>{question.explanation}</Text>
            ) : null}
          </Card>
        </AnimatedEntrance>
      ) : null}

      {submitted ? (
        <RippleButton
          label={index + 1 < questions.length ? 'Siguiente pregunta' : 'Ver resultado'}
          icon="arrow-right"
          onPress={next}
        />
      ) : (
        <RippleButton label="Comprobar respuesta" icon="check-bold" disabled={selected === null} onPress={check} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: { gap: 12 },
  questionText: { fontSize: 16.5, fontWeight: '700', lineHeight: 23 },
  options: { gap: 9 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 14, padding: 13, minHeight: 56 },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19 },
  feedback: { gap: 6 },
  feedbackTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackHeading: { fontSize: 15, fontWeight: '800' },
  explanation: { fontSize: 13.5, lineHeight: 19 },
  result: { alignItems: 'center', gap: 10, paddingVertical: 28, overflow: 'hidden' },
  resultTitle: { fontSize: 21, fontWeight: '800' },
  resultText: { fontSize: 14 },
});
