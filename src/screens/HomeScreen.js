import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Flame from 'reicon-react-native/icons/Flame';
import Cpu from 'reicon-react-native/icons/Cpu';
import Trophy from 'reicon-react-native/icons/Trophy';
import { shadows } from '../theme/colors';
import { uniguajiraCurriculumSubjects } from '../data/uniguajiraData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import SubjectCard from '../components/SubjectCard';
import StatCard from '../components/StatCard';
import RecentActivityCard from '../components/RecentActivityCard';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from '../components/AnimatedContainer';

export default function HomeScreen() {
  const { user, subjects, activities, stats, addSubject, setCurrentScreen } = useAuth();
  const { theme, isDark } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre de la materia.');
      return;
    }

    addSubject({
      name: newSubjectName,
      code: newSubjectCode.trim() || 'MAT-101',
      description: newSubjectDesc.trim() || 'Materia de estudio',
    });

    setNewSubjectName('');
    setNewSubjectCode('');
    setNewSubjectDesc('');
    setModalVisible(false);
    Alert.alert('¡Materia Creada!', `Se ha registrado "${newSubjectName}" correctamente.`);
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Notificaciones StudyIA',
      '• Tu resumen de Inteligencia Artificial está listo.\n• Recuerda repasar tu mazo de Bases de Datos para mantener tu racha de 7 días.',
      [{ text: 'Cerrar' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        user={user}
        onNotificationPress={handleNotificationPress}
        onProfilePress={() => setCurrentScreen('Profile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Hero AI con micro-animación pulsante */}
        <AnimatedEntrance type="slideUp" duration={500} delay={100}>
          <View style={[styles.heroBanner, { backgroundColor: isDark ? '#1E1B4B' : '#312E81' }]}>
            <View style={styles.heroContent}>
              <View style={styles.aiTag}>
                <AnimatedPulse>
                  <MaterialCommunityIcons name="creation" size={14} color="#FBBF24" />
                </AnimatedPulse>
                <Text style={styles.aiTagText}>MOTOR DE IA ACTIVO</Text>
              </View>

              <Text style={styles.heroTitle}>Transforma tus apuntes en estudio inteligente</Text>
              <Text style={styles.heroSubtitle}>
                Sube fotos de tu cuaderno, diapositivas o PDFs para crear resúmenes y flashcards al instante.
              </Text>

              <View style={styles.heroButtonsRow}>
                <AnimatedPressable
                  style={[styles.heroPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setCurrentScreen('Upload')}
                >
                  <MaterialCommunityIcons name="camera-plus" size={18} color="#FFFFFF" />
                  <Text style={styles.heroPrimaryBtnText}>Escanear con IA</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.heroSecondaryBtn}
                  onPress={() => setCurrentScreen('Quiz')}
                >
                  <MaterialCommunityIcons name="play-circle-outline" size={18} color="#EEF2FF" />
                  <Text style={styles.heroSecondaryBtnText}>Quiz de prueba</Text>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Métricas y Racha de Estudio con animación staggered */}
        <AnimatedEntrance type="slideUp" duration={500} delay={200}>
          <View style={styles.statsRow}>
            <StatCard
              reicon={Flame}
              title="Racha"
              value={`${stats.streak} días`}
              subtitle="¡Vas invicto!"
              color={theme.accentAmber}
            />
            <StatCard
              reicon={Cpu}
              title="Apuntes IA"
              value={stats.totalNotes}
              subtitle="Procesados"
              color={theme.accentPurple}
            />
            <StatCard
              reicon={Trophy}
              title="Promedio"
              value={`${stats.averageScore}%`}
              subtitle="En cuestionarios"
              color={theme.accentGreen}
            />
          </View>
        </AnimatedEntrance>

        {/* Sección: Mis Materias */}
        <AnimatedEntrance type="slideUp" duration={500} delay={300}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Mis Materias</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Selecciona una materia para ver sus recursos</Text>
            </View>
            <AnimatedPressable
              style={[styles.addSubjectBtn, { backgroundColor: theme.primaryLight }]}
              onPress={() => setModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color={theme.primary} />
              <Text style={[styles.addSubjectText, { color: theme.primary }]}>Nueva</Text>
            </AnimatedPressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectsScroll}
          >
            {subjects.map((subj, index) => (
              <AnimatedEntrance
                key={subj.id}
                type="scale"
                duration={400}
                delay={350 + index * 60}
              >
                <SubjectCard
                  subject={subj}
                  style={styles.subjectCardItem}
                  onPress={() => {
                    Alert.alert(
                      subj.name,
                      `Código: ${subj.code}\n${subj.description}\n\n• ${subj.notesCount} apuntes procesados.\n• Progreso: ${subj.progress}%`,
                      [
                        { text: 'Cerrar' },
                        {
                          text: 'Escanear apunte aquí',
                          onPress: () => setCurrentScreen('Upload'),
                        },
                      ]
                    );
                  }}
                />
              </AnimatedEntrance>
            ))}
          </ScrollView>
        </AnimatedEntrance>

        {/* Sección: Actividad Reciente con IA */}
        <AnimatedEntrance type="slideUp" duration={500} delay={450}>
          <View style={[styles.sectionHeader, { marginTop: 12 }]}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Generado recientemente</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Materiales sintetizados por StudyIA</Text>
            </View>
            <TouchableOpacity onPress={() => setCurrentScreen('Quiz')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {activities.map((act, index) => (
              <AnimatedEntrance
                key={act.id}
                type="slideUp"
                duration={400}
                delay={500 + index * 80}
              >
                <RecentActivityCard
                  activity={act}
                  onPress={() => {
                    Alert.alert(
                      act.title,
                      `${act.snippet}\n\nGenerado para: ${act.subject} (${act.time})`,
                      [{ text: 'Entendido' }]
                    );
                  }}
                />
              </AnimatedEntrance>
            ))}
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* Modal para Crear Nueva Materia */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialCommunityIcons name="book-plus-outline" size={24} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nueva Materia</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Organiza tus notas, resúmenes y flashcards por asignatura.
            </Text>

            {/* Sugerencias del Pensum de Uniguajira */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
              Catálogo Curricular Uniguajira (Toca para autocompletar):
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.curriculumChipScroll}
            >
              {uniguajiraCurriculumSubjects.map((cur, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.curriculumChip,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    newSubjectName === cur.name && { borderColor: theme.primary, backgroundColor: `${theme.primary}20` },
                  ]}
                  onPress={() => {
                    setNewSubjectName(cur.name);
                    setNewSubjectCode(cur.code);
                    setNewSubjectDesc(cur.desc);
                  }}
                >
                  <Text style={[styles.curriculumChipText, { color: theme.primary }]}>
                    {cur.name} ({cur.code})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Nombre de la Asignatura *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Ej. Algoritmos y Estructuras"
                placeholderTextColor={theme.textMuted}
                value={newSubjectName}
                onChangeText={setNewSubjectName}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Código / Sigla</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Ej. ALG-201"
                placeholderTextColor={theme.textMuted}
                value={newSubjectCode}
                onChangeText={setNewSubjectCode}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Descripción breve</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary, height: 60, textAlignVertical: 'top' },
                ]}
                placeholder="Ej. Temas sobre árboles, grafos y complejidad algorítmica."
                placeholderTextColor={theme.textMuted}
                value={newSubjectDesc}
                onChangeText={setNewSubjectDesc}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.surfaceElevated }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>

              <AnimatedPressable
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreateSubject}
              >
                <Text style={styles.modalSaveText}>Guardar Materia</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...shadows.md,
  },
  heroContent: {
    gap: 8,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 18,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    ...shadows.sm,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  addSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addSubjectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subjectsScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  subjectCardItem: {
    marginRight: 2,
  },
  activitiesList: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  curriculumChipScroll: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 14,
  },
  curriculumChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  curriculumChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
