import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BoltIcon from 'reicon-react-native/icons/Bolt';
import { CareerPicker } from '@/components/CareerPicker';
import {
  AnimatedEntrance,
  AnimatedPressable,
  AnimatedPulse,
  RippleButton,
  SlidingTabs,
} from '@/components/motion';
import { Banner, Card, Field, KeyboardScrollView } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

type Mode = 'login' | 'register';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn, signUp, resetPassword, continueAsGuest, isSupabaseConfigured } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [career, setCareer] = useState('Ingeniería de Sistemas');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    setError(null);
    if (isRegister && !name.trim()) return setError('Ingresa tu nombre completo.');
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Ingresa un correo electrónico válido.');
    if (isRegister && password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (!password) return setError('Ingresa tu contraseña.');
    if (isRegister && password !== confirm) return setError('Las contraseñas no coinciden.');

    setSubmitting(true);
    const result = isRegister
      ? await signUp({ name: name.trim(), email, password, career: career.trim() })
      : await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  const forgotPassword = async () => {
    setError(null);
    if (!EMAIL_PATTERN.test(email.trim())) {
      return setError('Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".');
    }
    const result = await resetPassword(email);
    if (result.error) return setError(result.error);
    Alert.alert('Revisa tu correo', `Enviamos un enlace para restablecer la contraseña a ${email.trim()}.`);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <AnimatedEntrance type="scale" style={styles.brand}>
          <AnimatedPulse>
            <View style={[styles.logo, { backgroundColor: theme.primaryLight, borderColor: theme.borderFocus }]}>
              <MaterialCommunityIcons name="brain" size={44} color={theme.primary} />
            </View>
          </AnimatedPulse>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>StudyIA</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Tu aliado inteligente para aprender</Text>
          <View style={[styles.pill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="school" size={14} color={theme.primary} />
            <Text style={[styles.pillText, { color: theme.primary }]}>Universidad de La Guajira</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={120}>
          <Card style={styles.form}>
            <SlidingTabs<Mode>
              tabs={[
                { id: 'login', label: 'Iniciar sesión' },
                { id: 'register', label: 'Crear cuenta' },
              ]}
              value={mode}
              onChange={(next) => {
                setMode(next);
                setError(null);
              }}
            />

            {error ? (
              <AnimatedEntrance type="slideDown" duration={220}>
                <Banner tone="error" icon="alert-circle-outline" title={error} />
              </AnimatedEntrance>
            ) : null}

            {isRegister ? (
              <AnimatedEntrance type="slideDown" duration={260}>
                <Field
                  label="Nombre completo"
                  icon="account-outline"
                  placeholder="Tu nombre"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </AnimatedEntrance>
            ) : null}

            <Field
              label="Correo electrónico"
              icon="email-outline"
              placeholder="estudiante@uniguajira.edu.co"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />

            {isRegister ? (
              <AnimatedEntrance type="slideDown" duration={260}>
                <Field
                  label="Programa académico"
                  icon="book-education-outline"
                  placeholder="Ej. Ingeniería de Sistemas"
                  value={career}
                  onChangeText={setCareer}
                  right={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Ver catálogo de programas"
                      hitSlop={10}
                      onPress={() => setPickerVisible(true)}
                    >
                      <MaterialCommunityIcons name="chevron-down" size={24} color={theme.primary} />
                    </Pressable>
                  }
                />
              </AnimatedEntrance>
            ) : null}

            <Field
              label="Contraseña"
              icon="lock-outline"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  hitSlop={10}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textMuted}
                  />
                </Pressable>
              }
            />

            {isRegister ? (
              <AnimatedEntrance type="slideDown" duration={260}>
                <Field
                  label="Confirmar contraseña"
                  icon="lock-check-outline"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={confirm}
                  onChangeText={setConfirm}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
              </AnimatedEntrance>
            ) : (
              <Pressable accessibilityRole="button" onPress={forgotPassword} style={styles.forgot}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            )}

            <RippleButton
              label={isRegister ? 'Crear mi cuenta' : 'Entrar a StudyIA'}
              icon={isRegister ? 'account-plus' : 'arrow-right'}
              loading={submitting}
              onPress={submit}
            />

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>o sin cuenta</Text>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            </View>

            <AnimatedPressable
              onPress={continueAsGuest}
              style={[
                styles.guest,
                {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                },
              ]}
            >
              <BoltIcon size={20} color={theme.accentAmber} weight="Filled" />
              <View style={styles.guestText}>
                <Text style={[styles.guestTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                  Continuar sin cuenta
                </Text>
                <Text style={[styles.guestHint, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                  Tus datos quedan solo en este teléfono, sin respaldo ni IA en la nube.
                </Text>
              </View>
            </AnimatedPressable>
          </Card>
        </AnimatedEntrance>

        {!isSupabaseConfigured ? (
          <Banner
            tone="warning"
            icon="cloud-off-outline"
            title="Nube sin configurar"
            message="Falta el archivo .env con las credenciales de Supabase."
          />
        ) : null}

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Ingeniería de Sistemas · Proyecto Final de Móvil
        </Text>
      </KeyboardScrollView>

      <CareerPicker
        visible={pickerVisible}
        value={career}
        onSelect={setCareer}
        onClose={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 16, flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 4 },
  logo: { width: 84, height: 84, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  appName: { fontSize: 30, fontWeight: '900' },
  tagline: { fontSize: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  pillText: { fontSize: 11.5, fontWeight: '700' },
  form: { gap: 13 },
  forgot: { alignSelf: 'flex-end', paddingVertical: 4 },
  forgotText: { fontSize: 12.5, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 12 },
  guest: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  guestText: { flex: 1 },
  guestTitle: { fontSize: 14, fontWeight: '800' },
  guestHint: { fontSize: 11.5, marginTop: 1, lineHeight: 16 },
  footer: { fontSize: 11.5, textAlign: 'center' },
});
