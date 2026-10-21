import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function SubjectCard({ subject, onPress, style }) {
  const { theme } = useTheme();
  const { name, code, notesCount, progress, color, icon } = subject;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon || 'book-open-outline'} size={24} color={color} />
        </View>
        <View style={[styles.codeBadge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.codeText, { color }]}>{code}</Text>
        </View>
      </View>

      <Text style={[styles.subjectName, { color: theme.textPrimary }]} numberOfLines={1}>
        {name}
      </Text>

      <View style={styles.notesRow}>
        <MaterialCommunityIcons name="file-document-outline" size={14} color={theme.textMuted} />
        <Text style={[styles.notesText, { color: theme.textMuted }]}>{notesCount} apuntes procesados</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.textMuted }]}>Comprensión</Text>
          <Text style={[styles.progressPercent, { color }]}>{progress}%</Text>
        </View>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9' }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    width: 210,
    borderWidth: 1,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
