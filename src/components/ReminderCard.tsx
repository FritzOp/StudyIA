import React from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Banner, Card, Chip } from '@/components/ui';
import { useReminders } from '@/context/RemindersContext';
import { useTheme } from '@/context/ThemeContext';
import { describeReminderDate, formatHour } from '@/lib/progress';
import { REMINDER_HOURS } from '@/services/reminders';

export function ReminderCard() {
  const { theme } = useTheme();
  const { available, settings, permission, nextPlan, setEnabled, setHour } = useReminders();

  if (!available) return null;
  const active = settings.enabled && permission === 'granted';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bell-ring-outline" size={20} color={theme.primary} />
        <View style={styles.flex}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Recordatorio de repaso</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Te avisa cuando tengas flashcards pendientes o tu racha esté en riesgo.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Activar recordatorio de repaso"
          value={active}
          onValueChange={setEnabled}
          trackColor={{ true: theme.primary, false: theme.border }}
          thumbColor="#FFFFFF"
        />
      </View>

      {permission === 'blocked' ? (
        <Banner
          tone="warning"
          icon="bell-off-outline"
          title="Notificaciones bloqueadas"
          message="Actívalas en los ajustes del teléfono para recibir recordatorios."
          action={
            <Text
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              style={[styles.link, { color: theme.primary }]}
            >
              Ajustes
            </Text>
          }
        />
      ) : null}

      {active ? (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Hora del aviso</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {REMINDER_HOURS.map((hour) => (
              <Chip
                key={hour}
                label={formatHour(hour)}
                selected={settings.hour === hour}
                onPress={() => setHour(hour)}
              />
            ))}
          </ScrollView>
          <Text style={[styles.next, { color: theme.textSecondary }]}>
            {nextPlan
              ? `Próximo aviso: ${describeReminderDate(nextPlan.date)} · ${nextPlan.body}`
              : 'Por ahora no hay nada pendiente: te avisaremos cuando tengas flashcards por repasar.'}
          </Text>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 11 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700' },
  chips: { gap: 7, paddingRight: 8 },
  next: { fontSize: 12.5, lineHeight: 18 },
  link: { fontSize: 13, fontWeight: '800', padding: 4 },
});
