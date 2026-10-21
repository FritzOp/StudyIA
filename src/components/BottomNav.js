import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function BottomNav({ currentScreen, onSelectScreen }) {
  const { theme } = useTheme();

  const tabs = [
    { key: 'Home', label: 'Inicio', icon: 'home-variant', activeIcon: 'home-variant' },
    { key: 'Subjects', label: 'Materias', icon: 'book-outline', activeIcon: 'book-open-page-variant' },
    { key: 'Upload', label: 'Escanear IA', icon: 'camera-plus', isFab: true },
    { key: 'Quiz', label: 'Práctica', icon: 'cards-outline', activeIcon: 'cards' },
    { key: 'Profile', label: 'Perfil', icon: 'account-outline', activeIcon: 'account' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.key;

        if (tab.isFab) {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.fabButton}
              onPress={() => onSelectScreen(tab.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.fabInner, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
                <MaterialCommunityIcons name={tab.icon} size={26} color="#FFFFFF" />
              </View>
              <Text style={[styles.fabLabel, { color: theme.primary }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectScreen(tab.key)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.primary : theme.textMuted, fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.md,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 55,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
  },
  fabButton: {
    alignItems: 'center',
    top: -14,
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 3,
  },
  fabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
});
