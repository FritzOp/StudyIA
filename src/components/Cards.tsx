import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedPressable, ProgressBar, SlidingNumber } from '@/components/motion';
import { asIcon, type IconName } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import type { Activity, Material } from '@/db/schema';
import { timeAgo, type SubjectStats } from '@/lib/study';
import { shadows } from '@/theme/colors';

export function StatCard({
  icon,
  title,
  value,
  suffix,
  subtitle,
  color,
}: {
  icon: IconName;
  title: string;
  value: number;
  suffix?: string;
  subtitle?: string;
  color: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <SlidingNumber value={value} suffix={suffix} fontSize={19} color={theme.textPrimary} />
      <Text style={[styles.statTitle, { color: theme.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.statSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SubjectCard({
  stats,
  onPress,
  onLongPress,
  compact = false,
}: {
  stats: SubjectStats;
  onPress: () => void;
  onLongPress?: () => void;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const { subject, materials, progress, due } = stats;
  const description = subject.description.trim();

  return (
    <AnimatedPressable
      accessibilityLabel={`${subject.name}, ${materials} apuntes, comprensión ${progress} por ciento`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.subject,
        compact && styles.subjectCompact,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.subjectTop}>
        <View style={[styles.subjectIcon, { backgroundColor: `${subject.color}20` }]}>
          <MaterialCommunityIcons name={asIcon(subject.icon)} size={24} color={subject.color} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.subjectName, { color: theme.textPrimary }]} numberOfLines={compact ? 2 : 1}>
            {subject.name}
          </Text>
          {subject.code ? (
            <Text style={[styles.subjectCode, { color: subject.color }]} numberOfLines={1}>
              {subject.code}
            </Text>
          ) : null}
        </View>
      </View>

      {!compact && description ? (
        <Text style={[styles.subjectDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      <View style={styles.subjectFooter}>
        <Text style={[styles.subjectMeta, { color: theme.textMuted }]}>
          {materials} {materials === 1 ? 'apunte' : 'apuntes'}
          {due > 0 ? ` · ${due} por repasar` : ''}
        </Text>
        <Text style={[styles.subjectPercent, { color: subject.color }]}>{progress}%</Text>
      </View>
      <ProgressBar value={progress} color={subject.color} trackColor={theme.surfaceElevated} />
    </AnimatedPressable>
  );
}

const ACTIVITY_LOOK: Record<Activity['type'], { icon: IconName; color: string }> = {
  material: { icon: 'text-box-check-outline', color: '#6366F1' },
  flashcards: { icon: 'cards-outline', color: '#06B6D4' },
  quiz: { icon: 'checkbox-marked-circle-outline', color: '#10B981' },
};

export function ActivityCard({ activity, onPress }: { activity: Activity; onPress?: () => void }) {
  const { theme } = useTheme();
  const look = ACTIVITY_LOOK[activity.type];
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
      style={[styles.row, { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: 1 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${look.color}18` }]}>
        <MaterialCommunityIcons name={look.icon} size={21} color={look.color} />
      </View>
      <View style={styles.flex}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowOverline, { color: theme.primary }]} numberOfLines={1}>
            {activity.subjectName}
          </Text>
          <Text style={[styles.rowTime, { color: theme.textMuted }]}>{timeAgo(activity.createdAt)}</Text>
        </View>
        <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={[styles.rowDetail, { color: theme.textSecondary }]} numberOfLines={2}>
          {activity.detail}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const SOURCE_ICON: Record<Material['sourceType'], IconName> = {
  text: 'text-long',
  image: 'image-text',
  pdf: 'file-pdf-box',
  document: 'file-document-outline',
};

export function MaterialCard({
  material,
  subjectName,
  onPress,
  onLongPress,
}: {
  material: Material;
  subjectName?: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { theme } = useTheme();
  const status = {
    ready: {
      label: material.generator === 'local' ? 'Listo · sin IA' : 'Listo · con IA',
      color: material.generator === 'local' ? theme.warning : theme.success,
    },
    pending: { label: 'Pendiente', color: theme.warning },
    processing: { label: 'Procesando…', color: theme.primary },
    error: { label: 'Con error', color: theme.error },
  }[material.status];

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      scaleTo={0.98}
      style={[styles.row, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.primaryLight }]}>
        <MaterialCommunityIcons name={SOURCE_ICON[material.sourceType]} size={21} color={theme.primary} />
      </View>
      <View style={styles.flex}>
        {subjectName ? (
          <Text style={[styles.rowOverline, { color: theme.primary }]} numberOfLines={1}>
            {subjectName}
          </Text>
        ) : null}
        <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {material.title}
        </Text>
        <View style={styles.rowStatus}>
          <View style={[styles.dot, { backgroundColor: status.color }]} />
          <Text style={[styles.rowTime, { color: theme.textMuted }]}>
            {status.label} · {timeAgo(material.createdAt)}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stat: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, gap: 3, ...shadows.sm },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  statTitle: { fontSize: 12, fontWeight: '700' },
  statSubtitle: { fontSize: 10.5 },
  subject: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 8, ...shadows.sm },
  subjectCompact: { width: 214 },
  subjectTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  subjectIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 15, fontWeight: '800' },
  subjectCode: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  subjectDescription: { fontSize: 12.5, lineHeight: 17 },
  subjectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectMeta: { fontSize: 11.5, fontWeight: '500', flex: 1 },
  subjectPercent: { fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 15, borderWidth: 1, padding: 12, ...shadows.sm },
  rowIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowOverline: { fontSize: 11, fontWeight: '700', flexShrink: 1 },
  rowTime: { fontSize: 11 },
  rowTitle: { fontSize: 14, fontWeight: '700', marginTop: 1 },
  rowDetail: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  rowStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
