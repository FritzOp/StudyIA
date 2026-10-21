import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function StatCard({ icon, reicon: ReiconComp, title, value, subtitle, color }) {
  const { theme } = useTheme();
  const accentColor = color || theme.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
        {ReiconComp ? (
          <ReiconComp size={22} color={accentColor} weight="Filled" />
        ) : (
          <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    ...shadows.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 10,
  },
});
