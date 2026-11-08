import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MobileIcon from 'reicon-react-native/icons/Mobile';
import MoonIcon from 'reicon-react-native/icons/Moon';
import SunIcon from 'reicon-react-native/icons/Sun';
import { CareersCard } from '@/components/CareersCard';
import { AnimatedEntrance, AnimatedPressable, RippleButton, SlidingNumber } from '@/components/motion';
import { ReminderCard } from '@/components/ReminderCard';
import { Banner, Card, Field, Screen } from '@/components/ui';
import { useAuth, useUserId } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { profilesRepo } from '@/db/repositories/profiles';
import type { Profile } from '@/db/schema';
import { useProfile, useStudyOverview } from '@/hooks/useStudyData';
import { initialsOf, timeAgo } from '@/lib/study';

export default function ProfileScreen() {
  const { email, isGuest, signOut } = useAuth();
  const { theme, themeMode, setThemeMode, systemColorScheme } = useTheme();
  const { stats } = useStudyOverview();
  const sync = useSync();
  const profile = useProfile();
  const [editing, setEditing] = useState(false);

  const themeOptions: { id: ThemeMode; label: string; description: string; Icon: typeof SunIcon }[] = [
    { id: 'light', label: 'Claro', description: 'Fondo blanco y colores vivos', Icon: SunIcon },
    { id: 'dark', label: 'Oscuro', description: 'Ideal para la noche o con poca luz', Icon: MoonIcon },
    {
      id: 'system',
      label: 'Sistema',
      description: `Sigue al teléfono (ahora ${systemColorScheme === 'dark' ? 'oscuro' : 'claro'})`,
      Icon: MobileIcon,
    },
  ];

  const backupStatus = sync.isSyncing
    ? 'Respaldando tus cambios...'
    : sync.pendingCount > 0
      ? sync.isOnline
        ? `${sync.pendingCount} cambios por subir. Se subirán solos en unos segundos.`
        : `${sync.pendingCount} cambios guardados en el teléfono. Se subirán solos al volver la conexión.`
      : sync.lastSyncedAt
        ? `Todo está respaldado. Se hace automáticamente; última vez: ${timeAgo(sync.lastSyncedAt).toLowerCase()}.`
        : 'Tus cambios se respaldan automáticamente.';

  const handleSignOut = () => {
    const warning =
      sync.pendingCount > 0
        ? `Tienes ${sync.pendingCount} cambios sin respaldar. Quedarán en este teléfono y se subirán cuando vuelvas a entrar.`
        : 'Tus datos seguirán guardados en este teléfono.';
    Alert.alert(isGuest ? '¿Salir del modo sin cuenta?' : '¿Cerrar sesión?', warning, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen title="Mi perfil">
      <AnimatedEntrance type="scale">
        <Card style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initialsOf(profile?.name ?? '')}</Text>
          </View>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{profile?.name ?? 'Estudiante'}</Text>
          {email ? <Text style={[styles.email, { color: theme.textMuted }]}>{email}</Text> : null}
          <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="school" size={14} color={theme.primary} />
            <Text style={[styles.badgeText, { color: theme.primary }]} numberOfLines={1}>
              {profile?.career} · {profile?.semester}
            </Text>
          </View>
          <Text style={[styles.institution, { color: theme.textSecondary }]}>{profile?.institution}</Text>
          <RippleButton label="Editar perfil" icon="pencil-outline" variant="soft" onPress={() => setEditing(true)} />
        </Card>
      </AnimatedEntrance>

      {profile ? (
        <AnimatedEntrance delay={40}>
          <CareersCard profile={profile} />
        </AnimatedEntrance>
      ) : null}

      <AnimatedEntrance delay={70}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={isGuest ? 'cellphone-lock' : sync.isOnline ? 'cloud-check-outline' : 'cloud-off-outline'}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Respaldo en la nube</Text>
          </View>
          {isGuest ? (
            <Banner
              tone="warning"
              icon="alert-outline"
              title="Sin respaldo"
              message="En modo sin cuenta tus datos solo existen en este teléfono."
            />
          ) : (
            <>
              <Text style={[styles.cardText, { color: theme.textSecondary }]}>{backupStatus}</Text>
              {sync.lastError ? (
                <Banner
                  tone="warning"
                  icon="cloud-sync-outline"
                  title="No se pudo respaldar todavía"
                  message={`${sync.lastError} Se reintentará automáticamente; tus datos están seguros en este teléfono.`}
                />
              ) : null}
            </>
          )}
        </Card>
      </AnimatedEntrance>

      <AnimatedEntrance delay={120}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Rendimiento académico</Text>
          <View style={styles.grid}>
            {[
              { label: 'Apuntes', value: stats.materials, suffix: '' },
              { label: 'Resúmenes', value: stats.summaries, suffix: '' },
              { label: 'Flashcards', value: stats.cards, suffix: '' },
              { label: 'Promedio quiz', value: stats.average, suffix: '%' },
            ].map((item) => (
              <View key={item.label} style={[styles.gridItem, { backgroundColor: theme.surfaceElevated }]}>
                <SlidingNumber value={item.value} suffix={item.suffix} fontSize={22} color={theme.primary} />
                <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </AnimatedEntrance>

      <AnimatedEntrance delay={150}>
        <ReminderCard />
      </AnimatedEntrance>

      <AnimatedEntrance delay={170}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="palette-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Tema de la aplicación</Text>
          </View>
          {themeOptions.map(({ id, label, description, Icon }) => {
            const selected = themeMode === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setThemeMode(id)}
                style={[
                  styles.themeRow,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: selected ? theme.primary : 'transparent',
                  },
                ]}
              >
                <View style={[styles.themeIcon, { backgroundColor: selected ? theme.primary : `${theme.primary}18` }]}>
                  <Icon size={20} color={selected ? theme.onPrimary : theme.primary} weight={selected ? 'Filled' : 'Outline'} />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.themeLabel, { color: theme.textPrimary }]}>{label}</Text>
                  <Text style={[styles.themeDescription, { color: theme.textMuted }]}>{description}</Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={selected ? theme.primary : theme.textMuted}
                />
              </Pressable>
            );
          })}
        </Card>
      </AnimatedEntrance>

      <AnimatedEntrance delay={220}>
        <Card style={styles.menu}>
          <AnimatedPressable scaleTo={0.98} onPress={() => router.push('/universidad')} style={styles.menuItem}>
            <MaterialCommunityIcons name="domain" size={22} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Oferta académica Uniguajira</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <AnimatedPressable
            scaleTo={0.98}
            onPress={() =>
              Alert.alert(
                'Acerca de StudyIA',
                'Proyecto Final de Desarrollo Móvil. Ingeniería de Sistemas, Universidad de La Guajira.\n\nStudyIA usa la API de Gemini de Google. En su plan gratuito, Google puede usar el contenido enviado para mejorar sus productos, así que evita subir datos personales.'
              )
            }
            style={styles.menuItem}
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Acerca de StudyIA</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
        </Card>
      </AnimatedEntrance>

      <RippleButton
        label={isGuest ? 'Salir del modo sin cuenta' : 'Cerrar sesión'}
        icon="logout"
        variant="danger"
        onPress={handleSignOut}
      />

      {profile ? <EditProfile visible={editing} profile={profile} onClose={() => setEditing(false)} /> : null}
    </Screen>
  );
}

function EditProfile({
  visible,
  profile,
  onClose,
}: {
  visible: boolean;
  profile: Profile;
  onClose: () => void;
}) {
  const userId = useUserId();
  const { theme } = useTheme();
  const [name, setName] = useState(profile.name);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    await profilesRepo.update(userId, {
      name: name.trim(),
      career: profile.career,
      semester: profile.semester,
      institution: profile.institution,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Editar perfil</Text>
          <Field
            label="Nombre"
            icon="account-outline"
            value={name}
            error={error}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
          />
          <View style={styles.sheetActions}>
            <View style={styles.flex}>
              <RippleButton label="Cancelar" variant="ghost" onPress={onClose} />
            </View>
            <View style={styles.flex}>
              <RippleButton label="Guardar" icon="check" onPress={save} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { alignItems: 'center', gap: 5 },
  avatar: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  email: { fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, maxWidth: '100%' },
  badgeText: { fontSize: 11.5, fontWeight: '700', flexShrink: 1 },
  institution: { fontSize: 12.5, fontWeight: '600', marginBottom: 8 },
  card: { gap: 11 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardText: { fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  gridItem: { flexBasis: '47%', flexGrow: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 12, gap: 3 },
  gridLabel: { fontSize: 11.5, fontWeight: '600' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderRadius: 14, borderWidth: 1.5 },
  themeIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 14, fontWeight: '700' },
  themeDescription: { fontSize: 11.5, marginTop: 1 },
  menu: { paddingVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 50 },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 18, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
