import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import migrations from '../../drizzle/migrations';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SyncProvider } from '@/context/SyncContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Database />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/** Las migraciones corren antes de montar cualquier pantalla que lea SQLite. */
function Database() {
  const { theme } = useTheme();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    SplashScreen.hideAsync();
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorTitle, { color: theme.error }]}>Error al preparar la base de datos</Text>
        <Text style={[styles.errorDetail, { color: theme.textMuted }]}>{error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SyncProvider>
        <RootNavigator />
      </SyncProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { userId, loading } = useAuth();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}
      >
        {/* Sin usuario solo existe el acceso; con usuario, el resto de la app. */}
        <Stack.Protected guard={!!userId}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="materia/[id]" />
          <Stack.Screen name="materia/editar" options={{ presentation: 'modal' }} />
          <Stack.Screen name="material/[id]" />
          <Stack.Screen name="estudio/flashcards" />
          <Stack.Screen name="estudio/quiz" />
          <Stack.Screen name="universidad" />
        </Stack.Protected>
        <Stack.Protected guard={!userId}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  errorTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  errorDetail: { fontSize: 13, textAlign: 'center' },
});
