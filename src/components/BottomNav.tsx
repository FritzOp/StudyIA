import React, { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/motion';
import type { IconName } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { shadows } from '@/theme/colors';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; icon: IconName; activeIcon: IconName; fab?: boolean }> = {
  index: { label: 'Inicio', icon: 'home-variant-outline', activeIcon: 'home-variant' },
  materias: { label: 'Materias', icon: 'book-outline', activeIcon: 'book-open-page-variant' },
  escanear: { label: 'Escanear', icon: 'camera-plus', activeIcon: 'camera-plus', fab: true },
  practica: { label: 'Práctica', icon: 'cards-outline', activeIcon: 'cards' },
  perfil: { label: 'Perfil', icon: 'account-outline', activeIcon: 'account' },
};

const INDICATOR_WIDTH = 28;

export default function BottomNav({ state, emitter, navigateToTab }: TabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabWidth = width / Math.max(state.routes.length, 1);
  const x = useSharedValue(0);

  // Mismo efecto de Tabs de Animate UI: el indicador se desliza a la pestaña activa.
  useEffect(() => {
    x.set(
      withSpring(state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2, { damping: 18, stiffness: 200 })
    );
  }, [state.index, tabWidth, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  const onFab = TABS[state.routes[state.index]?.name]?.fab;

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.bar,
        { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + 6 },
      ]}
    >
      {width > 0 && !onFab ? (
        <Animated.View style={[styles.indicator, { backgroundColor: theme.primary }, indicator]} />
      ) : null}
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        if (tab.fab) {
          return (
            <View key={route.key} style={styles.tab}>
              <AnimatedPressable
                accessibilityLabel={tab.label}
                onPress={onPress}
                style={[styles.fab, { backgroundColor: theme.primary, borderColor: theme.surface }]}
              >
                <MaterialCommunityIcons name={tab.icon} size={25} color="#FFFFFF" />
              </AnimatedPressable>
              <Text style={[styles.label, styles.fabLabel, { color: theme.primary }]}>{tab.label}</Text>
            </View>
          );
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.tab}
          >
            <MaterialCommunityIcons
              name={focused ? tab.activeIcon : tab.icon}
              size={24}
              color={focused ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: focused ? theme.primary : theme.textMuted, fontWeight: focused ? '800' : '600' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    ...shadows.md,
  },
  indicator: { position: 'absolute', top: 0, left: 0, width: INDICATOR_WIDTH, height: 3, borderRadius: 2 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  label: { fontSize: 10.5, marginTop: 3 },
  fab: {
    width: 54,
    height: 54,
    marginTop: -26,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  fabLabel: { fontWeight: '800' },
});
