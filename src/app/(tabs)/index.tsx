import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityCard, StatCard, SubjectCard } from '@/components/Cards';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse, RippleButton } from '@/components/motion';
import { Banner, EmptyState, SectionTitle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import { useProfile, useStudyOverview } from '@/hooks/useStudyData';
import { initialsOf } from '@/lib/study';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '¡Buenos días!';
  if (hour < 18) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { isGuest } = useAuth();
  const { canUseCloud, isOnline, lastError } = useSync();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const { stats, bySubject, activities } = useStudyOverview();

  const engine = canUseCloud
    ? { label: 'IA EN LA NUBE ACTIVA', color: '#34D399' }
    : isGuest
      ? { label: 'MODO LOCAL · SIN CUENTA', color: '#FBBF24' }
      : { label: isOnline ? 'RECONECTANDO…' : 'SIN CONEXIÓN · MODO LOCAL', color: '#FBBF24' };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir a mi perfil"
          onPress={() => router.navigate('/perfil')}
          style={[styles.avatar, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={[styles.avatarText, { color: theme.primary }]}>{initialsOf(profile?.name ?? '')}</Text>
        </Pressable>
        <View style={styles.flex}>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>{greeting()}</Text>
          <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
            {profile?.name ?? 'Estudiante'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${stats.due} flashcards por repasar`}
          onPress={() => router.navigate('/practica')}
          style={[styles.bell, { backgroundColor: theme.primaryLight }]}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color={theme.textPrimary} />
          {stats.due > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.error, borderColor: theme.surface }]}>
              <Text style={styles.badgeText}>{stats.due > 99 ? '99+' : stats.due}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedEntrance>
          <View style={[styles.hero, { backgroundColor: isDark ? '#1E1B4B' : '#312E81' }]}>
            <View style={styles.engine}>
              <AnimatedPulse active={canUseCloud}>
                <MaterialCommunityIcons name="creation" size={14} color={engine.color} />
              </AnimatedPulse>
              <Text style={[styles.engineText, { color: engine.color }]}>{engine.label}</Text>
            </View>
            <Text style={styles.heroTitle}>Transforma tus apuntes en estudio inteligente</Text>
            <Text style={styles.heroSubtitle}>
              Sube una foto, un PDF o tu texto y obtén un resumen, flashcards y un quiz.
            </Text>
            <RippleButton
              label="Escanear apunte"
              icon="camera-plus"
              onPress={() => router.navigate('/escanear')}
            />
          </View>
        </AnimatedEntrance>

        {lastError && !isGuest ? (
          <Banner tone="warning" icon="cloud-alert" title="Respaldo sin completar" message={lastError} />
        ) : null}

        <AnimatedEntrance delay={80}>
          <View style={styles.stats}>
            <StatCard icon="fire" title="Racha" value={stats.streak} suffix=" d" color={theme.accentAmber} />
            <StatCard icon="file-document-multiple-outline" title="Apuntes" value={stats.materials} color={theme.accentPurple} />
            <StatCard icon="trophy-outline" title="Promedio" value={stats.average} suffix="%" color={theme.accentGreen} />
          </View>
        </AnimatedEntrance>

        {stats.due > 0 ? (
          <AnimatedEntrance delay={120}>
            <AnimatedPressable
              onPress={() => router.push({ pathname: '/estudio/flashcards', params: { due: '1' } })}
              style={[styles.due, { backgroundColor: theme.cardBg, borderColor: theme.primary }]}
            >
              <MaterialCommunityIcons name="cards-playing-outline" size={26} color={theme.primary} />
              <View style={styles.flex}>
                <Text style={[styles.dueTitle, { color: theme.textPrimary }]}>
                  {stats.due} {stats.due === 1 ? 'flashcard' : 'flashcards'} por repasar
                </Text>
                <Text style={[styles.dueSubtitle, { color: theme.textMuted }]}>Toca para empezar el repaso de hoy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={theme.primary} />
            </AnimatedPressable>
          </AnimatedEntrance>
        ) : null}

        <AnimatedEntrance delay={160}>
          <View style={styles.section}>
            <SectionTitle
              title="Mis materias"
              subtitle="Tus apuntes organizados por asignatura"
              right={
                <AnimatedPressable
                  accessibilityLabel="Nueva materia"
                  onPress={() => router.push('/materia/editar')}
                  style={[styles.add, { backgroundColor: theme.primaryLight }]}
                >
                  <MaterialCommunityIcons name="plus" size={18} color={theme.primary} />
                  <Text style={[styles.addText, { color: theme.primary }]}>Nueva</Text>
                </AnimatedPressable>
              }
            />
            {bySubject.length === 0 ? (
              <EmptyState
                icon="book-plus-outline"
                title="Crea tu primera materia"
                message="Organiza tus apuntes por asignatura para seguir tu progreso en cada una."
                actionLabel="Crear materia"
                onAction={() => router.push('/materia/editar')}
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjects}
              >
                {bySubject.map((item) => (
                  <SubjectCard
                    key={item.subject.id}
                    compact
                    stats={item}
                    onPress={() =>
                      router.push({ pathname: '/materia/[id]', params: { id: item.subject.id } })
                    }
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </AnimatedEntrance>

        {activities.length > 0 ? (
          <AnimatedEntrance delay={220}>
            <View style={styles.section}>
              <SectionTitle title="Actividad reciente" subtitle="Lo último que has estudiado" />
              {activities.slice(0, 5).map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={
                    activity.materialId
                      ? () =>
                          router.push({
                            pathname: '/material/[id]',
                            params: { id: activity.materialId as string },
                          })
                      : undefined
                  }
                />
              ))}
            </View>
          </AnimatedEntrance>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  greeting: { fontSize: 12 },
  userName: { fontSize: 17, fontWeight: '800' },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: '800' },
  content: { padding: 16, gap: 16, paddingBottom: 28 },
  hero: { borderRadius: 22, padding: 18, gap: 8 },
  engine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engineText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  heroSubtitle: { color: '#C7D2FE', fontSize: 13, lineHeight: 19, marginBottom: 6 },
  stats: { flexDirection: 'row', gap: 10 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14 },
  dueTitle: { fontSize: 14, fontWeight: '800' },
  dueSubtitle: { fontSize: 12, marginTop: 1 },
  section: { gap: 10 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, minHeight: 36, borderRadius: 18 },
  addText: { fontSize: 12.5, fontWeight: '800' },
  subjects: { gap: 10, paddingVertical: 2, paddingRight: 8 },
});
