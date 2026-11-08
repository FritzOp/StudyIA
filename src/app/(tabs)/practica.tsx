import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatCard } from '@/components/Cards';
import { QuizTrendChart, WeeklyActivityChart } from '@/components/Charts';
import { AnimatedEntrance, AnimatedPressable, ProgressBar, ProgressRing, RippleButton, SlidingNumber } from '@/components/motion';
import { Card, EmptyState, Screen, SectionTitle } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useStudyOverview } from '@/hooks/useStudyData';
import { quizTrend, weeklyActivity } from '@/lib/progress';
import { percentage, timeAgo } from '@/lib/study';

export default function PracticeScreen() {
  const { theme } = useTheme();
  const { stats, bySubject, attempts, materials, subjects, activities } = useStudyOverview();

  const ready = useMemo(() => materials.filter((m) => m.status === 'ready'), [materials]);
  const titleOf = useCallback(
    (id: string) => materials.find((m) => m.id === id)?.title ?? 'Apunte eliminado',
    [materials]
  );
  const week = useMemo(() => weeklyActivity(activities), [activities]);
  const trend = useMemo(() => quizTrend(attempts, titleOf), [attempts, titleOf]);
  const subjectOf = (id: string) => subjects.find((s) => s.id === id)?.name ?? '';

  return (
    <Screen title="Práctica y progreso" subtitle="Repasa y mira cuánto has avanzado">
      <AnimatedEntrance type="scale">
        <Card style={styles.overview}>
          <ProgressRing value={stats.progress} color={theme.primary} trackColor={theme.surfaceElevated}>
            <SlidingNumber value={stats.progress} suffix="%" fontSize={24} color={theme.textPrimary} />
          </ProgressRing>
          <View style={styles.flex}>
            <Text style={[styles.overviewTitle, { color: theme.textPrimary }]}>Comprensión general</Text>
            <Text style={[styles.overviewText, { color: theme.textSecondary }]}>
              {stats.mastered} de {stats.cards} flashcards dominadas y {stats.average}% de promedio en quizzes.
            </Text>
          </View>
        </Card>
      </AnimatedEntrance>

      <AnimatedEntrance delay={70}>
        <View style={styles.stats}>
          <StatCard icon="fire" title="Racha" value={stats.streak} suffix=" d" color={theme.accentAmber} />
          <StatCard icon="cards-outline" title="Por repasar" value={stats.due} color={theme.secondary} />
          <StatCard icon="checkbox-marked-circle-outline" title="Quizzes" value={stats.quizzes} color={theme.accentGreen} />
        </View>
      </AnimatedEntrance>

      {stats.cards > 0 ? (
        <RippleButton
          label={stats.due > 0 ? `Repasar ${stats.due} flashcards` : 'Repasar todas las flashcards'}
          icon="cards-playing-outline"
          onPress={() =>
            router.push({ pathname: '/estudio/flashcards', params: stats.due > 0 ? { due: '1' } : {} })
          }
        />
      ) : null}

      {ready.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="Aún no hay nada que practicar"
          message="Sube tu primer apunte y aquí verás sus flashcards, quizzes y tu progreso."
          actionLabel="Escanear apunte"
          onAction={() => router.navigate('/escanear')}
        />
      ) : (
        <>
          <SectionTitle title="Quizzes disponibles" subtitle="Practica con tus apuntes procesados" />
          <View style={styles.list}>
            {ready.slice(0, 6).map((material) => (
              <AnimatedPressable
                key={material.id}
                onPress={() => router.push({ pathname: '/estudio/quiz', params: { materialId: material.id } })}
                scaleTo={0.98}
                style={[styles.row, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              >
                <MaterialCommunityIcons name="help-circle-outline" size={24} color={theme.primary} />
                <View style={styles.flex}>
                  <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {material.title}
                  </Text>
                  <Text style={[styles.rowMeta, { color: theme.textMuted }]} numberOfLines={1}>
                    {subjectOf(material.subjectId)}
                  </Text>
                </View>
                <MaterialCommunityIcons name="play-circle" size={26} color={theme.primary} />
              </AnimatedPressable>
            ))}
          </View>
        </>
      )}

      {activities.length > 0 ? (
        <>
          <SectionTitle title="Tu semana" subtitle="Apuntes, repasos y quizzes por día" />
          <Card>
            <WeeklyActivityChart days={week} />
          </Card>
        </>
      ) : null}

      {attempts.length > 0 ? (
        <>
          <SectionTitle
            title="Evolución en quizzes"
            subtitle={trend.length === 1 ? 'Tu primer resultado' : `Tus últimos ${trend.length} resultados`}
          />
          <Card>
            <QuizTrendChart points={trend} />
          </Card>
        </>
      ) : null}

      {bySubject.length > 0 ? (
        <>
          <SectionTitle title="Progreso por materia" />
          <Card style={styles.subjects}>
            {bySubject.map((item, index) => (
              <View key={item.subject.id} style={styles.subject}>
                <View style={styles.subjectTop}>
                  <Text style={[styles.subjectName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.subject.name}
                  </Text>
                  <Text style={[styles.subjectPercent, { color: theme.textPrimary }]}>{item.progress}%</Text>
                </View>
                <ProgressBar
                  value={item.progress}
                  color={item.subject.color}
                  trackColor={theme.surfaceElevated}
                  delay={index * 60}
                />
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {attempts.length > 0 ? (
        <>
          <SectionTitle title="Historial de resultados" />
          <View style={styles.list}>
            {attempts.slice(0, 10).map((attempt) => {
              const score = percentage(attempt.score, attempt.total);
              const color = score >= 60 ? theme.success : theme.error;
              return (
                <View
                  key={attempt.id}
                  style={[styles.row, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                >
                  <View style={[styles.score, { backgroundColor: `${color}18` }]}>
                    <Text style={[styles.scoreText, { color }]}>{score}%</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {titleOf(attempt.materialId)}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.textMuted }]}>
                      {attempt.score}/{attempt.total} correctas · {timeAgo(attempt.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overview: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  overviewTitle: { fontSize: 16, fontWeight: '800' },
  overviewText: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 10 },
  list: { gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 56 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowMeta: { fontSize: 12, marginTop: 1 },
  score: { width: 52, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 13, fontWeight: '800' },
  subjects: { gap: 13 },
  subject: { gap: 6 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  subjectName: { flex: 1, fontSize: 13.5, fontWeight: '700' },
  subjectPercent: { fontSize: 13, fontWeight: '800' },
});
