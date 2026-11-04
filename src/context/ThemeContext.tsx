import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, type Theme } from '@/theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'studyia.themeMode';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  systemColorScheme: ReturnType<typeof useColorScheme>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setMode] = useState<ThemeMode>('system');

  // El tema es una preferencia simple: va en AsyncStorage, no en SQLite ni en SecureStore.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setMode(saved);
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextType>(() => {
    const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
    return {
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      themeMode,
      systemColorScheme,
      setThemeMode: (mode) => {
        setMode(mode);
        AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => undefined);
      },
    };
  }, [themeMode, systemColorScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
