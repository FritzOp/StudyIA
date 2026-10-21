import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function RecentActivityCard({ activity, onPress }) {
  const { theme } = useTheme();
  const { title, subject, time, icon, color, snippet, score } = activity;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={[styles.subject, { color: theme.primary }]}>{subject}</Text>
          <Text style={[styles.time, { color: theme.textMuted }]}>{time}</Text>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>

        <Text style={[styles.snippet, { color: theme.textSecondary }]} numberOfLines={2}>
          {snippet}
        </Text>

        {score && (
          <View style={styles.scoreRow}>
            <MaterialCommunityIcons name="star-circle" size={14} color={theme.accentAmber} />
            <Text style={[styles.scoreText, { color: theme.textPrimary }]}>Calificación: {score}</Text>
          </View>
        )}
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    ...shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  subject: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  snippet: {
    fontSize: 12,
    lineHeight: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
