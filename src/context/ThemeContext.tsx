import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_FACULTY, FACULTY_ACCENTS } from '@/lib/careers';
import { darkTheme, lightTheme, type Theme } from '@/theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'studyia.themeMode';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  systemColorScheme: ReturnType<typeof useColorScheme>;
  /** Facultades de las carreras activas: la primera pinta la app; la segunda se mezcla. */
  setCareerFaculties: (facultyIds: string[]) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Aplica el color de la carrera principal y, si se mezclan, el de la segunda. */
export function applyCareerAccent(base: Theme, facultyIds: string[], isDark: boolean): Theme {
  const accents = facultyIds
    .map((id) => FACULTY_ACCENTS[id])
    .filter(Boolean)
    .map((accent) => (isDark ? accent.dark : accent.light));
  const [first, second] = accents;
  if (!first) return base;
  return {
    ...base,
    primary: first.primary,
    onPrimary: first.onPrimary,
    primaryLight: first.primaryLight,
    // Ingeniería conserva el borde de foco original de la app.
    borderFocus: facultyIds[0] === DEFAULT_FACULTY ? base.borderFocus : first.primary,
    hero: first.hero,
    heroAlt: second?.hero ?? null,
    secondary: second?.primary ?? base.secondary,
    secondaryLight: second?.primaryLight ?? base.secondaryLight,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setMode] = useState<ThemeMode>('system');
  const [faculties, setFaculties] = useState<string[]>([]);

  // El tema es una preferencia simple: va en AsyncStorage, no en SQLite ni en SecureStore.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setMode(saved);
      })
      .catch(() => undefined);
  }, []);

  // Solo cambia el estado si cambió la lista, para no repintar toda la app sin motivo.
  const setCareerFaculties = useCallback((ids: string[]) => {
    setFaculties((prev) => (prev.join(',') === ids.join(',') ? prev : ids));
  }, []);

  const value = useMemo<ThemeContextType>(() => {
    const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
    return {
      theme: applyCareerAccent(isDark ? darkTheme : lightTheme, faculties, isDark),
      isDark,
      themeMode,
      systemColorScheme,
      setThemeMode: (mode) => {
        setMode(mode);
        AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => undefined);
      },
      setCareerFaculties,
    };
  }, [themeMode, systemColorScheme, faculties, setCareerFaculties]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
