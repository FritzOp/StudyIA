import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCard } from '@/components/Cards';
import { AnimatedEntrance, ProgressRing, RippleButton, SlidingNumber } from '@/components/motion';
import { asIcon, Card, EmptyState, Screen, SectionTitle } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useStudyOverview } from '@/hooks/useStudyData';
import { confirmDeleteMaterial, confirmDeleteSubject } from '@/lib/confirmations';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { bySubject, materials } = useStudyOverview();

  const stats = bySubject.find((s) => s.subject.id === id);
  const own = useMemo(() => materials.filter((m) => m.subjectId === id), [materials, id]);

  if (!stats) return <Screen title="Materia" back>{null}</Screen>;
  const { subject } = stats;

  return (
    <Screen
      title={subject.name}
      subtitle={subject.code || undefined}
      back
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar materia"
          hitSlop={10}
          onPress={() => router.push({ pathname: '/materia/editar', params: { id: subject.id } })}
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      }
    >
      <AnimatedEntrance type="scale">
        <Card style={styles.summary}>
          <ProgressRing value={stats.progress} size={96} strokeWidth={9} color={subject.color} trackColor={theme.surfaceElevated}>
            <MaterialCommunityIcons name={asIcon(subject.icon)} size={30} color={subject.color} />
          </ProgressRing>
          <View style={styles.flex}>
            <SlidingNumber value={stats.progress} suffix="%" fontSize={26} color={theme.textPrimary} />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>de comprensión</Text>
            <Text style={[styles.summaryMeta, { color: theme.textMuted }]}>
              {stats.cards} flashcards · {stats.attempts} {stats.attempts === 1 ? 'quiz' : 'quizzes'}
            </Text>
          </View>
        </Card>
      </AnimatedEntrance>

      {subject.description ? (
        <Text style={[styles.description, { color: theme.textSecondary }]}>{subject.description}</Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.flex}>
          <RippleButton
            label="Agregar apunte"
            icon="plus"
            onPress={() => router.navigate({ pathname: '/escanear', params: { subjectId: subject.id } })}
          />
        </View>
        {stats.cards > 0 ? (
          <View style={styles.flex}>
            <RippleButton
              label="Repasar"
              icon="cards-outline"
              variant="soft"
              onPress={() =>
                router.push({ pathname: '/estudio/flashcards', params: { subjectId: subject.id } })
              }
            />
          </View>
        ) : null}
      </View>

      <SectionTitle title="Apuntes" subtitle="Mantén presionado un apunte para eliminarlo" />
      {own.length === 0 ? (
        <EmptyState
          icon="file-document-plus-outline"
          title="Sin apuntes todavía"
          message="Sube una foto, un PDF o tu texto para generar el material de estudio."
        />
      ) : (
        <View style={styles.list}>
          {own.map((material, index) => (
            <AnimatedEntrance key={material.id} delay={Math.min(index, 8) * 40}>
              <MaterialCard
                material={material}
                onPress={() => router.push({ pathname: '/material/[id]', params: { id: material.id } })}
                onLongPress={() => confirmDeleteMaterial(material)}
              />
            </AnimatedEntrance>
          ))}
        </View>
      )}

      <RippleButton
        label="Eliminar materia"
        icon="trash-can-outline"
        variant="danger"
        onPress={() => confirmDeleteSubject(subject, () => router.back())}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryMeta: { fontSize: 12, marginTop: 4 },
  description: { fontSize: 13.5, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  list: { gap: 10 },
});
