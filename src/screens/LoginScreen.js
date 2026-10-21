import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Bolt from 'reicon-react-native/icons/Bolt';
import { shadows } from '../theme/colors';
import { getAllUndergraduatePrograms } from '../data/uniguajiraData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from '../components/AnimatedContainer';

export default function LoginScreen() {
  const { login, register, loginAsDemo, isSupabaseActive } = useAuth();
  const { theme, isDark } = useTheme();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [career, setCareer] = useState('Ingeniería de Sistemas');
  const [careerModalVisible, setCareerModalVisible] = useState(false);
  const [careerSearch, setCareerSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (isRegistering) {
      if (!name.trim()) {
        setErrorMessage('Por favor ingresa tu nombre completo.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Por favor ingresa un correo electrónico válido.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }

      const res = await register({
        name,
        email,
        password,
        role: 'Estudiante Universitario',
        institution: 'Universidad de La Guajira',
        career,
      });

      if (res && !res.success) {
        setErrorMessage(res.error || 'Error al registrar cuenta en Supabase.');
      }
    } else {
      if (!email.trim()) {
        setErrorMessage('Ingresa tu correo institucional o personal.');
        return;
      }
      if (!password) {
        setErrorMessage('Ingresa tu contraseña.');
        return;
      }
      const res = await login(email, password);
      if (res && !res.success) {
        setErrorMessage(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Se enviará un enlace de restablecimiento a tu correo electrónico institucional.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado e Identidad StudyIA */}
        <AnimatedEntrance type="scale" duration={500} delay={100} style={styles.header}>
          <AnimatedPulse>
            <View style={[styles.logoBadge, { backgroundColor: theme.primaryLight, borderColor: theme.borderFocus }]}>
              <MaterialCommunityIcons name="brain" size={44} color={theme.primary} />
            </View>
          </AnimatedPulse>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>StudyIA</Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>Tu aliado inteligente para aprender</Text>

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <View style={[styles.uniguajiraPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="school" size={14} color={theme.primary} />
              <Text style={[styles.uniguajiraText, { color: theme.primary }]}>Universidad de La Guajira</Text>
            </View>

            <View
              style={[
                styles.uniguajiraPill,
                {
                  backgroundColor: isSupabaseActive ? `${theme.success}18` : theme.surfaceElevated,
                  borderColor: isSupabaseActive ? theme.success : theme.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isSupabaseActive ? 'database-check' : 'database-sync'}
                size={13}
                color={isSupabaseActive ? theme.success : theme.textMuted}
              />
              <Text
                style={[
                  styles.uniguajiraText,
                  { color: isSupabaseActive ? theme.success : theme.textMuted },
                ]}
              >
                {isSupabaseActive ? 'Supabase Conectado' : 'Base de Datos Local'}
              </Text>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Tarjeta de Formulario */}
        <AnimatedEntrance type="slideUp" duration={550} delay={250}>
          <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {/* Selector Login / Registro */}
            <View style={[styles.toggleContainer, { backgroundColor: theme.surfaceElevated }]}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isRegistering && [styles.toggleBtnActive, { backgroundColor: theme.cardBg }]]}
                onPress={() => {
                  setIsRegistering(false);
                  setErrorMessage('');
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: !isRegistering ? theme.primary : theme.textMuted },
                    !isRegistering && styles.toggleTextActive,
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, isRegistering && [styles.toggleBtnActive, { backgroundColor: theme.cardBg }]]}
                onPress={() => {
                  setIsRegistering(true);
                  setErrorMessage('');
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isRegistering ? theme.primary : theme.textMuted },
                    isRegistering && styles.toggleTextActive,
                  ]}
                >
                  Crear Cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mensaje de error */}
            {errorMessage ? (
              <AnimatedEntrance type="slideDown" duration={250}>
                <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.error} />
                  <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
                </View>
              </AnimatedEntrance>
            ) : null}

            {/* Campos Registro: Nombre */}
            {isRegistering && (
              <AnimatedEntrance type="slideDown" duration={300} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Nombre Completo</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="Ej. Tu Nombre Completo"
                    placeholderTextColor={theme.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </AnimatedEntrance>
            )}

            {/* Campo Correo */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Correo Electrónico</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="estudiante@uniguajira.edu.co"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Campos Registro: Carrera */}
            {isRegistering && (
              <AnimatedEntrance type="slideDown" duration={300} style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                    Programa Académico / Carrera
                  </Text>
                  <TouchableOpacity onPress={() => setCareerModalVisible(true)}>
                    <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>Catálogo Uniguajira</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="book-education-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="Ej. Ingeniería de Sistemas"
                    placeholderTextColor={theme.textMuted}
                    value={career}
                    onChangeText={setCareer}
                  />
                  <TouchableOpacity
                    onPress={() => setCareerModalVisible(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ paddingHorizontal: 6 }}
                  >
                    <MaterialCommunityIcons name="chevron-down" size={22} color={theme.primary} />
                  </TouchableOpacity>
                </View>

                {/* Chips de sugerencias rápidas */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingTop: 8 }}
                >
                  {[
                    'Ingeniería de Sistemas',
                    'Ingeniería Industrial',
                    'Ingeniería Ambiental',
                    'Derecho',
                    'Administración de Empresas',
                    'Lic. Etnoeducación',
                    'Biología',
                  ].map((sug) => {
                    const isSelected = career.toLowerCase() === sug.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={sug}
                        style={[
                          styles.careerChip,
                          {
                            backgroundColor: isSelected ? theme.primaryLight : theme.surfaceElevated,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setCareer(sug)}
                      >
                        <Text
                          style={[
                            styles.careerChipText,
                            { color: isSelected ? theme.primary : theme.textSecondary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {sug}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </AnimatedEntrance>
            )}

            {/* Campo Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Contraseña</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Confirmar Contraseña (Registro) */}
            {isRegistering && (
              <AnimatedEntrance type="slideDown" duration={300} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Confirmar Contraseña</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </AnimatedEntrance>
            )}

            {/* Enlace Olvidé mi contraseña */}
            {!isRegistering && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassBtn}>
                <Text style={[styles.forgotPassText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            {/* Botón Principal */}
            <AnimatedPressable style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>
                {isRegistering ? 'Crear mi Cuenta' : 'Entrar a StudyIA'}
              </Text>
              <MaterialCommunityIcons
                name={isRegistering ? 'account-plus' : 'arrow-right'}
                size={20}
                color="#FFFFFF"
              />
            </AnimatedPressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>o prueba rápida</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Botón Acceso Rápido Demo */}
            <AnimatedPressable
              style={[
                styles.demoBtn,
                {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                },
              ]}
              onPress={loginAsDemo}
            >
              <Bolt size={20} color={theme.accentAmber} weight="Filled" />
              <Text style={[styles.demoBtnText, { color: isDark ? '#FBBF24' : '#92400E' }]}>Acceso Rápido Demo</Text>
            </AnimatedPressable>
          </View>
        </AnimatedEntrance>

        {/* Footer info */}
        <AnimatedEntrance type="fade" duration={600} delay={400}>
          <Text style={[styles.footerNote, { color: theme.textMuted }]}>
            Ingeniería de Sistemas • Proyecto Final de Móvil (Equipo de 3)
          </Text>
        </AnimatedEntrance>
      </ScrollView>

      {/* Modal Selector de Carreras Uniguajira */}
      <Modal
        visible={careerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCareerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="school" size={24} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Programas Uniguajira</Text>
              </View>
              <TouchableOpacity onPress={() => setCareerModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Selecciona tu carrera oficial de la Universidad de La Guajira:
            </Text>

            {/* Buscador */}
            <View style={[styles.modalSearchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.modalSearchInput, { color: theme.textPrimary }]}
                placeholder="Buscar carrera o facultad..."
                placeholderTextColor={theme.textMuted}
                value={careerSearch}
                onChangeText={setCareerSearch}
              />
              {careerSearch ? (
                <TouchableOpacity onPress={() => setCareerSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Lista de programas */}
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {getAllUndergraduatePrograms()
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(careerSearch.toLowerCase()) ||
                    p.facultyName.toLowerCase().includes(careerSearch.toLowerCase()) ||
                    p.code.toLowerCase().includes(careerSearch.toLowerCase())
                )
                .map((p) => {
                  const isSelected = career.toLowerCase() === p.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.programItem,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.surfaceElevated,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setCareer(p.name);
                        setCareerModalVisible(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.programItemName,
                            { color: isSelected ? theme.primary : theme.textPrimary },
                            isSelected && { fontWeight: '800' },
                          ]}
                        >
                          {p.name}
                        </Text>
                        <Text style={[styles.programItemFaculty, { color: theme.textMuted }]}>
                          {p.facultyName} • {p.code} ({p.credits} créditos)
                        </Text>
                      </View>
                      {isSelected ? (
                        <MaterialCommunityIcons name="check-circle" size={20} color={theme.primary} />
                      ) : (
                        <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
              onPress={() => setCareerModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  uniguajiraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
  },
  uniguajiraText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    ...shadows.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    ...shadows.sm,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...shadows.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    marginHorizontal: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 11,
  },
  careerChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  careerChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginBottom: 12,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  programItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  programItemFaculty: {
    fontSize: 11,
    marginTop: 2,
  },
  closeModalBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
