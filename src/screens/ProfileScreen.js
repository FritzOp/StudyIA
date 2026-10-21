import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Sun from 'reicon-react-native/icons/Sun';
import Moon from 'reicon-react-native/icons/Moon';
import Mobile from 'reicon-react-native/icons/Mobile';
import { shadows } from '../theme/colors';
import {
  uniguajiraFaculties,
  uniguajiraCampuses,
  uniguajiraPostgraduates,
  uniguajiraDiplomas,
  uniguajiraInstitutionalInfo,
} from '../data/uniguajiraData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedEntrance, AnimatedPressable } from '../components/AnimatedContainer';

export default function ProfileScreen() {
  const { user, stats, logout } = useAuth();
  const { theme, themeMode, setThemeMode, systemColorScheme } = useTheme();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [uniguajiraModalVisible, setUniguajiraModalVisible] = useState(false);
  const [uniguajiraTab, setUniguajiraTab] = useState('pregrados'); // 'pregrados' | 'posgrados' | 'diplomados' | 'sedes'
  const [uniguajiraSearch, setUniguajiraSearch] = useState('');

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
    ]);
  };

  const themeOptions = [
    {
      id: 'light',
      label: 'Claro (White)',
      description: 'Fondo blanco y colores vivos',
      component: Sun,
    },
    {
      id: 'dark',
      label: 'Oscuro (Dark)',
      description: 'Ideal para la noche o baja luz',
      component: Moon,
    },
    {
      id: 'system',
      label: 'Sistema',
      description: `Sigue al teléfono (Actual: ${systemColorScheme === 'dark' ? 'Oscuro' : 'Claro'})`,
      component: Mobile,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Tarjeta de Perfil */}
      <AnimatedEntrance type="scale" duration={450}>
        <View style={[styles.profileHeader, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
            style={[styles.avatar, { borderColor: theme.primaryLight }]}
          />
          <Text style={[styles.name, { color: theme.textPrimary }]}>{user?.name || 'Estudiante'}</Text>
          <Text style={[styles.email, { color: theme.textMuted }]}>{user?.email || 'estudiante@uniguajira.edu.co'}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name="school" size={14} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>{user?.career || 'Ingeniería de Sistemas'}</Text>
            </View>
          </View>

          <Text style={[styles.institution, { color: theme.textSecondary }]}>
            {user?.institution || 'Universidad de La Guajira'}
          </Text>
        </View>
      </AnimatedEntrance>

      {/* Selector de Modo de Tema (Claro, Oscuro, Sistema) */}
      <AnimatedEntrance type="slideUp" duration={450} delay={120}>
        <View style={[styles.themeCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="palette-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Tema de la Aplicación</Text>
          </View>
          <Text style={[styles.themeSubtitle, { color: theme.textMuted }]}>
            Personaliza la interfaz visual según tus preferencias o el modo del sistema.
          </Text>

          <View style={styles.themeOptionsGrid}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeOptionItem,
                    { backgroundColor: theme.surfaceElevated, borderColor: isSelected ? theme.primary : theme.border },
                    isSelected && { borderWidth: 2 },
                  ]}
                  onPress={() => setThemeMode(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.themeOptionLeft}>
                    <View
                      style={[
                        styles.themeIconBox,
                        { backgroundColor: isSelected ? theme.primary : `${theme.primary}18` },
                      ]}
                    >
                      <opt.component
                        size={20}
                        color={isSelected ? '#FFFFFF' : theme.primary}
                        weight={isSelected ? 'Filled' : 'Outline'}
                      />
                    </View>
                    <View style={styles.themeTextContainer}>
                      <Text style={[styles.themeOptionLabel, { color: theme.textPrimary }]}>{opt.label}</Text>
                      <Text style={[styles.themeOptionDesc, { color: theme.textMuted }]}>{opt.description}</Text>
                    </View>
                  </View>

                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={isSelected ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </AnimatedEntrance>

      {/* Tarjeta de Rendimiento Académico */}
      <AnimatedEntrance type="slideUp" duration={450} delay={200}>
        <View style={[styles.statsCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>Rendimiento Académico</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalNotes}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Apuntes subidos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.summariesGenerated}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Resúmenes IA</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.flashcardsLearned}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Flashcards</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.averageScore}%</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Promedio Quiz</Text>
            </View>
          </View>
        </View>
      </AnimatedEntrance>

      {/* Menú de Configuración y Acerca De */}
      <AnimatedEntrance type="slideUp" duration={450} delay={280}>
        <View style={[styles.menuCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => setSettingsModalVisible(true)}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Configuración y Preferencias</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => setUniguajiraModalVisible(true)}
          >
            <MaterialCommunityIcons name="domain" size={22} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>
              Oferta Académica Uniguajira (7 Facultades y Sedes)
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Acerca de StudyIA',
                'Proyecto Final para la Universidad de La Guajira.\nDesarrollado con React Native y Expo Go.\nEquipo de Ingeniería de Sistemas (3 integrantes).'
              )
            }
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Acerca del Proyecto StudyIA</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
        </View>
      </AnimatedEntrance>

      {/* Botón Cerrar Sesión */}
      <AnimatedEntrance type="slideUp" duration={450} delay={350}>
        <AnimatedPressable style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Cerrar Sesión</Text>
        </AnimatedPressable>
      </AnimatedEntrance>

      {/* Modal de Configuración Adicional */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Configuraciones de StudyIA</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Ajustes generales de la aplicación para el procesamiento de apuntes y notificaciones.
            </Text>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Notificaciones de Racha</Text>
                <Text style={[styles.settingSub, { color: theme.textMuted }]}>Recordatorio diario para repasar flashcards</Text>
              </View>
              <MaterialCommunityIcons name="toggle-switch" size={36} color={theme.primary} />
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Calidad de Captura de Cámara</Text>
                <Text style={[styles.settingSub, { color: theme.textMuted }]}>Alta resolución para OCR optimizado</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
            </View>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Oferta Académica Oficial Uniguajira */}
      <Modal
        visible={uniguajiraModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUniguajiraModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border, maxHeight: '90%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <MaterialCommunityIcons name="school" size={26} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    Universidad de La Guajira
                  </Text>
                  <Text style={[styles.modalSub, { color: theme.primary }]}>
                    {uniguajiraInstitutionalInfo.slogan}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setUniguajiraModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Pestañas de Navegación */}
            <View style={[styles.uTabsContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              {[
                { id: 'pregrados', label: 'Pregrados', icon: 'school-outline' },
                { id: 'posgrados', label: 'Posgrados', icon: 'certificate-outline' },
                { id: 'diplomados', label: 'Diplomados', icon: 'book-open-page-variant-outline' },
                { id: 'sedes', label: 'Identidad y Sedes', icon: 'domain' },
              ].map((tab) => {
                const isActive = uniguajiraTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.uTabBtn,
                      isActive && [styles.uTabBtnActive, { backgroundColor: theme.cardBg, borderColor: theme.primary }],
                    ]}
                    onPress={() => setUniguajiraTab(tab.id)}
                  >
                    <MaterialCommunityIcons
                      name={tab.icon}
                      size={16}
                      color={isActive ? theme.primary : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.uTabText,
                        { color: isActive ? theme.primary : theme.textMuted },
                        isActive && styles.uTabTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Barra de Búsqueda (para Pregrados, Posgrados y Diplomados) */}
            {uniguajiraTab !== 'sedes' && (
              <View style={[styles.uSearchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <MaterialCommunityIcons name="magnify" size={20} color={theme.textMuted} />
                <TextInput
                  style={[styles.uSearchInput, { color: theme.textPrimary }]}
                  placeholder={`Buscar en ${uniguajiraTab}...`}
                  placeholderTextColor={theme.textMuted}
                  value={uniguajiraSearch}
                  onChangeText={setUniguajiraSearch}
                  clearButtonMode="while-editing"
                />
                {uniguajiraSearch ? (
                  <TouchableOpacity onPress={() => setUniguajiraSearch('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Contenido según Pestaña */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* TAB 1: PREGRADOS */}
              {uniguajiraTab === 'pregrados' && (
                <View>
                  <Text style={[styles.uSectionDesc, { color: theme.textSecondary }]}>
                    7 Facultades universitarias con carreras profesionales y tecnológicas de alta pertinencia regional.
                  </Text>
                  {uniguajiraFaculties
                    .map((fac) => {
                      const filteredPrograms = fac.programs.filter((p) =>
                        p.name.toLowerCase().includes(uniguajiraSearch.toLowerCase()) ||
                        p.code.toLowerCase().includes(uniguajiraSearch.toLowerCase())
                      );
                      if (uniguajiraSearch && filteredPrograms.length === 0) return null;

                      return (
                        <View
                          key={fac.id}
                          style={[styles.facultyCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                        >
                          <View style={styles.facultyHeader}>
                            <View style={[styles.facultyDot, { backgroundColor: fac.color }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.facultyTitle, { color: theme.textPrimary }]}>{fac.name}</Text>
                              <Text style={[styles.facultyDesc, { color: theme.textMuted }]}>{fac.description}</Text>
                            </View>
                          </View>

                          <View style={styles.programsList}>
                            {filteredPrograms.map((p) => (
                              <View key={p.id} style={[styles.programRow, { borderBottomColor: theme.border }]}>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={fac.color} />
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.programName, { color: theme.textPrimary }]}>{p.name}</Text>
                                  <View style={styles.programBadges}>
                                    <View style={[styles.badgeChip, { backgroundColor: `${fac.color}18` }]}>
                                      <Text style={[styles.badgeChipText, { color: fac.color }]}>{p.code}</Text>
                                    </View>
                                    <View style={[styles.badgeChip, { backgroundColor: theme.cardBg }]}>
                                      <Text style={[styles.badgeChipText, { color: theme.textMuted }]}>{p.degree} • {p.credits} créditos</Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* TAB 2: POSGRADOS */}
              {uniguajiraTab === 'posgrados' && (
                <View>
                  <Text style={[styles.uSectionDesc, { color: theme.textSecondary }]}>
                    Doctorados de investigación, maestrías de profundización y especializaciones para el desarrollo territorial.
                  </Text>
                  {uniguajiraPostgraduates
                    .filter(
                      (pos) =>
                        pos.name.toLowerCase().includes(uniguajiraSearch.toLowerCase()) ||
                        pos.faculty.toLowerCase().includes(uniguajiraSearch.toLowerCase()) ||
                        pos.type.toLowerCase().includes(uniguajiraSearch.toLowerCase())
                    )
                    .map((pos) => {
                      const typeColor =
                        pos.type === 'Doctorado'
                          ? '#8B5CF6'
                          : pos.type === 'Maestría'
                          ? '#6366F1'
                          : '#06B6D4';

                      return (
                        <View
                          key={pos.id}
                          style={[styles.posCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                        >
                          <View style={styles.posCardTop}>
                            <View style={[styles.posTypeBadge, { backgroundColor: `${typeColor}20` }]}>
                              <MaterialCommunityIcons
                                name={pos.type === 'Doctorado' ? 'star-circle' : 'certificate'}
                                size={14}
                                color={typeColor}
                              />
                              <Text style={[styles.posTypeBadgeText, { color: typeColor }]}>{pos.type}</Text>
                            </View>
                            <Text style={[styles.posFacultyText, { color: theme.textMuted }]}>{pos.faculty}</Text>
                          </View>
                          <Text style={[styles.posName, { color: theme.textPrimary }]}>{pos.name}</Text>
                          <Text style={[styles.posDesc, { color: theme.textSecondary }]}>{pos.desc}</Text>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* TAB 3: DIPLOMADOS */}
              {uniguajiraTab === 'diplomados' && (
                <View>
                  <Text style={[styles.uSectionDesc, { color: theme.textSecondary }]}>
                    Programas de educación continuada y extensión habilitados para cualificación profesional y opción de grado.
                  </Text>
                  {uniguajiraDiplomas
                    .filter(
                      (d) =>
                        d.name.toLowerCase().includes(uniguajiraSearch.toLowerCase()) ||
                        d.area.toLowerCase().includes(uniguajiraSearch.toLowerCase()) ||
                        d.desc.toLowerCase().includes(uniguajiraSearch.toLowerCase())
                    )
                    .map((d) => (
                      <View
                        key={d.id}
                        style={[styles.diplomaCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                      >
                        <View style={styles.diplomaTop}>
                          <View style={[styles.diplomaAreaBadge, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.diplomaAreaText, { color: theme.primary }]}>{d.area}</Text>
                          </View>
                          <View style={[styles.diplomaHoursBadge, { backgroundColor: theme.cardBg }]}>
                            <MaterialCommunityIcons name="clock-outline" size={12} color={theme.textMuted} />
                            <Text style={[styles.diplomaHoursText, { color: theme.textMuted }]}>{d.hours} horas</Text>
                          </View>
                        </View>
                        <Text style={[styles.diplomaName, { color: theme.textPrimary }]}>{d.name}</Text>
                        <Text style={[styles.diplomaDesc, { color: theme.textSecondary }]}>{d.desc}</Text>
                        <Text style={[styles.diplomaFaculty, { color: theme.textMuted }]}>
                          🏛️ {d.faculty}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              {/* TAB 4: IDENTIDAD Y SEDES */}
              {uniguajiraTab === 'sedes' && (
                <View>
                  {/* Reseña Histórica */}
                  <View style={[styles.infoBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MaterialCommunityIcons name="history" size={22} color={theme.primary} />
                      <Text style={[styles.infoBlockTitle, { color: theme.textPrimary }]}>Origen y Reconocimiento</Text>
                    </View>
                    <Text style={[styles.infoBlockText, { color: theme.textSecondary }]}>
                      Creada el <Text style={{ fontWeight: '700', color: theme.textPrimary }}>12 de noviembre de 1976</Text> mediante el Decreto 523 en cumplimiento de las Ordenanzas 011 y 022 de 1975 del Departamento de La Guajira. Reconocida formalmente como universidad mediante la Resolución No. 1770 del 24 de junio de 1995 del Ministerio de Educación Nacional de Colombia.
                    </Text>
                  </View>

                  {/* Misión y Visión */}
                  <View style={[styles.infoBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MaterialCommunityIcons name="compass-outline" size={22} color={theme.primary} />
                      <Text style={[styles.infoBlockTitle, { color: theme.textPrimary }]}>Misión Institucional</Text>
                    </View>
                    <Text style={[styles.infoBlockText, { color: theme.textSecondary }]}>
                      {uniguajiraInstitutionalInfo.mission}
                    </Text>
                  </View>

                  <View style={[styles.infoBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MaterialCommunityIcons name="eye-outline" size={22} color={theme.primary} />
                      <Text style={[styles.infoBlockTitle, { color: theme.textPrimary }]}>Visión 2030</Text>
                    </View>
                    <Text style={[styles.infoBlockText, { color: theme.textSecondary }]}>
                      {uniguajiraInstitutionalInfo.vision2030}
                    </Text>
                  </View>

                  {/* Valores Institucionales */}
                  <View style={[styles.infoBlock, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.primary} />
                      <Text style={[styles.infoBlockTitle, { color: theme.textPrimary }]}>Valores Rectores</Text>
                    </View>
                    <View style={styles.valuesGrid}>
                      {uniguajiraInstitutionalInfo.coreValues.map((val, idx) => (
                        <View key={idx} style={[styles.valChip, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                          <MaterialCommunityIcons name="check-circle" size={14} color={theme.primary} />
                          <Text style={[styles.valChipText, { color: theme.textPrimary }]}>{val}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Sedes y Extensiones */}
                  <Text style={[styles.uSectionTitle, { color: theme.primary, marginTop: 12 }]}>
                    🏛️ Red Departamental de Sedes y Extensiones
                  </Text>
                  <View style={styles.campusesGrid}>
                    {uniguajiraCampuses.map((c) => (
                      <View
                        key={c.id}
                        style={[styles.campusItem, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <MaterialCommunityIcons name={c.icon || 'domain'} size={20} color={theme.primary} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.campusName, { color: theme.textPrimary }]}>{c.name}</Text>
                            <Text style={[styles.campusType, { color: theme.primary }]}>{c.type}</Text>
                          </View>
                        </View>
                        <Text style={[styles.campusAddress, { color: theme.textMuted }]}>📍 {c.address}</Text>
                        <Text style={[styles.campusDesc, { color: theme.textSecondary }]}>{c.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Botón de Cierre */}
            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.primary, marginTop: 8 }]}
              onPress={() => setUniguajiraModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Volver a Mi Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  institution: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  themeCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16,
  },
  themeOptionsGrid: {
    gap: 10,
  },
  themeOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  themeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTextContainer: {
    flex: 1,
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeOptionDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  statsCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.sm,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  menuCard: {
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 12,
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeModalBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  uTabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    gap: 4,
  },
  uTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 4,
  },
  uTabBtnActive: {
    borderWidth: 1,
    ...shadows.sm,
  },
  uTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  uTabTextActive: {
    fontWeight: '800',
  },
  uSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  uSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  uSectionDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  uSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  facultyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    ...shadows.sm,
  },
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  facultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  facultyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  facultyDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  programsList: {
    gap: 8,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  programName: {
    fontSize: 13,
    fontWeight: '600',
  },
  programBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  badgeChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  posCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    ...shadows.sm,
  },
  posCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  posTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  posFacultyText: {
    fontSize: 10,
    fontWeight: '500',
  },
  posName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  posDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  diplomaCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    ...shadows.sm,
  },
  diplomaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  diplomaAreaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
  },
  diplomaAreaText: {
    fontSize: 10,
    fontWeight: '700',
  },
  diplomaHoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diplomaHoursText: {
    fontSize: 10,
    fontWeight: '600',
  },
  diplomaName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  diplomaDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  diplomaFaculty: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  infoBlock: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    ...shadows.sm,
  },
  infoBlockTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoBlockText: {
    fontSize: 12,
    lineHeight: 18,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  valChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  valChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  campusesGrid: {
    gap: 10,
  },
  campusItem: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    ...shadows.sm,
  },
  campusName: {
    fontSize: 13,
    fontWeight: '800',
  },
  campusType: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  campusAddress: {
    fontSize: 11,
    marginVertical: 3,
  },
  campusDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
