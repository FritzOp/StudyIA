import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedEntrance, AnimatedPressable } from '../components/AnimatedContainer';

export default function SubjectsScreen() {
  const { subjects, setCurrentScreen } = useAuth();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Mis Materias</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Gestiona tus cursos y su progreso de comprensión</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {subjects.map((item, index) => (
          <AnimatedEntrance key={item.id} type="slideUp" duration={400} delay={index * 70}>
            <AnimatedPressable
              style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => {
                Alert.alert(
                  item.name,
                  `${item.description}\n\n• ${item.notesCount} apuntes procesados.\n• Progreso: ${item.progress}%`,
                  [
                    { text: 'Volver' },
                    { text: 'Escanear Apunte', onPress: () => setCurrentScreen('Upload') },
                  ]
                );
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                <MaterialCommunityIcons name={item.icon || 'book-outline'} size={26} color={item.color} />
              </View>

              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={[styles.subjectName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.code, { color: item.color }]}>{item.code}</Text>
                </View>
                <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={[styles.notesText, { color: theme.textMuted }]}>{item.notesCount} materiales</Text>
                  <Text style={[styles.progressText, { color: item.color }]}>{item.progress}%</Text>
                </View>

                <View style={[styles.progressBarBg, { backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <View
                    style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]}
                  />
                </View>
              </View>
            </AnimatedPressable>
          </AnimatedEntrance>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scrollList: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...shadows.sm,
    gap: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
