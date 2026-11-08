import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CareerPicker } from '@/components/CareerPicker';
import { RippleButton } from '@/components/motion';
import { asIcon, Card, Chip } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { profilesRepo } from '@/db/repositories/profiles';
import type { Profile } from '@/db/schema';
import {
  addCareer,
  careerInfo,
  careerList,
  FACULTY_ACCENTS,
  makePrincipal,
  MAX_CAREERS,
  removeCareer,
  SEMESTERS,
  semesterNumber,
} from '@/lib/careers';

/**
 * Carreras del estudiante. La principal pinta la app y orienta a la IA; con «Mezclar temáticas»
 * se combinan todas.
 */
export function CareersCard({ profile }: { profile: Profile }) {
  const userId = useUserId();
  const { theme, isDark } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const careers = careerList(profile);
  const semester = semesterNumber(profile.semester);

  const save = (list: string[], mix = profile.mixCareers) =>
    profilesRepo.setCareers(userId, list, list.length > 1 && mix).catch(() => undefined);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="school-outline" size={20} color={theme.primary} />
        <View style={styles.flex}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Mis carreras</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Tu carrera principal le da color a la app y StudyIA explica tus apuntes con ejemplos de tu campo y al
            nivel de tu semestre.
          </Text>
        </View>
      </View>

      {careers.map((career, index) => {
        const info = careerInfo(career);
        const accent = info.facultyId
          ? FACULTY_ACCENTS[info.facultyId][isDark ? 'dark' : 'light'].primary
          : theme.textMuted;
        const principal = index === 0;
        return (
          <View
            key={career}
            style={[
              styles.row,
              { backgroundColor: theme.surfaceElevated, borderColor: principal ? theme.primary : 'transparent' },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: `${accent}26` }]}>
              <MaterialCommunityIcons name={asIcon(info.icon)} size={20} color={accent} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
                {career}
              </Text>
              <Text style={[styles.faculty, { color: theme.textMuted }]} numberOfLines={1}>
                {principal ? 'Principal · ' : ''}
                {info.facultyName ?? 'Fuera del catálogo'}
              </Text>
            </View>
            {!principal ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Hacer ${career} la carrera principal`}
                hitSlop={6}
                onPress={() => save(makePrincipal(careers, career))}
                style={styles.action}
              >
                <MaterialCommunityIcons name="star-outline" size={21} color={theme.primary} />
              </Pressable>
            ) : null}
            {careers.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${career}`}
                hitSlop={6}
                onPress={() => save(removeCareer(careers, career))}
                style={styles.action}
              >
                <MaterialCommunityIcons name="close" size={20} color={theme.textMuted} />
              </Pressable>
            ) : null}
          </View>
        );
      })}

      {careers.length < MAX_CAREERS ? (
        <RippleButton
          label={careers.length === 1 ? 'Agregar otra carrera' : 'Agregar carrera'}
          icon="plus"
          variant="soft"
          onPress={() => setPickerVisible(true)}
        />
      ) : null}

      {careers.length > 1 ? (
        <View style={[styles.mix, { borderTopColor: theme.border }]}>
          <View style={styles.flex}>
            <Text style={[styles.name, { color: theme.textPrimary }]}>Mezclar temáticas</Text>
            <Text style={[styles.faculty, { color: theme.textMuted }]}>
              {profile.mixCareers
                ? 'La app combina los colores de tus carreras y StudyIA relaciona cada apunte con todas.'
                : 'La app y StudyIA usan solo tu carrera principal. Toca la estrella para cambiarla.'}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Mezclar temáticas de mis carreras"
            value={profile.mixCareers}
            onValueChange={(mix) => save(careers, mix)}
            trackColor={{ true: theme.primary, false: theme.border }}
            thumbColor="#FFFFFF"
          />
        </View>
      ) : null}

      <View style={[styles.semester, { borderTopColor: theme.border }]}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>Semestre actual</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel="Semestre actual"
        >
          {SEMESTERS.map((item) => (
            <Chip
              key={item.number}
              label={item.short}
              selected={semester === item.number}
              onPress={() => profilesRepo.setSemester(userId, item.label).catch(() => undefined)}
            />
          ))}
        </ScrollView>
      </View>

      <CareerPicker
        visible={pickerVisible}
        value=""
        exclude={careers}
        title="Agregar carrera"
        allowCustom
        onSelect={(name) => save(addCareer(careers, name))}
        onClose={() => setPickerVisible(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 1.5 },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '700' },
  faculty: { fontSize: 11.5, marginTop: 1, lineHeight: 16 },
  action: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  semester: { gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  chips: { gap: 7, paddingRight: 8 },
  mix: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
});
