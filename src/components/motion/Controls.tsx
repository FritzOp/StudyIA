import React, { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_PATH = 'M5 12.5l4.5 4.5L19 7.5';
const CROSS_PATH = 'M7 7l10 10M17 7L7 17';
const PATH_LENGTH = 30;

/**
 * Versión móvil de Checkbox de Animate UI: el trazo se dibuja al marcar y se borra
 * al desmarcar, con un pequeño rebote de la casilla.
 */
export function AnimatedCheck({
  state,
  color,
  size = 26,
}: {
  /** none: vacía; selected: elegida; correct / wrong: ya calificada. */
  state: 'none' | 'selected' | 'correct' | 'wrong';
  color: string;
  size?: number;
}) {
  const { theme } = useTheme();
  const drawn = state === 'correct' || state === 'wrong';
  const on = state !== 'none';
  const draw = useSharedValue(drawn ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    draw.set(withTiming(drawn ? 1 : 0, { duration: 260 }));
    if (on) {
      scale.set(
        withSequence(
          withTiming(1.18, { duration: 110 }),
          withSpring(1, { damping: 9, stiffness: 180 })
        )
      );
    }
  }, [drawn, on, draw, scale]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - draw.get()),
  }));
  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View
      style={[
        styles.check,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: on ? color : theme.textMuted,
          backgroundColor: drawn ? color : on ? `${color}22` : 'transparent',
        },
        boxStyle,
      ]}
    >
      {state === 'selected' ? (
        <View
          style={{
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: size,
            backgroundColor: color,
          }}
        />
      ) : (
        <Svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
          <AnimatedPath
            d={state === 'wrong' ? CROSS_PATH : CHECK_PATH}
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={PATH_LENGTH}
            animatedProps={animatedProps}
          />
        </Svg>
      )}
    </Animated.View>
  );
}

export type TabItem<T extends string> = { id: T; label: string; icon?: IconName };

/** Versión móvil de Tabs de Animate UI: el resaltado se desliza hasta la pestaña activa. */
export function SlidingTabs<T extends string>({
  tabs,
  value,
  onChange,
  style,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const tabWidth = width / Math.max(tabs.length, 1);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const x = useSharedValue(0);

  useEffect(() => {
    x.set(
      reduced
        ? withTiming(index * tabWidth, { duration: 1 })
        : withSpring(index * tabWidth, { damping: 18, stiffness: 220 })
    );
  }, [index, tabWidth, reduced, x]);

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.tabs, { backgroundColor: theme.surfaceElevated }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - TABS_PADDING * 2)}
    >
      {width > 0 ? (
        <Animated.View
          style={[styles.highlight, { width: tabWidth, backgroundColor: theme.cardBg }, highlight]}
        />
      ) : null}
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
          >
            {tab.icon ? (
              <MaterialCommunityIcons
                name={tab.icon}
                size={16}
                color={active ? theme.primary : theme.textMuted}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                { color: active ? theme.primary : theme.textMuted, fontWeight: active ? '800' : '600' },
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

/** Versión móvil de Accordion de Animate UI: anima la altura real del contenido. */
export function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon?: IconName;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(defaultOpen ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(open ? 1 : 0, { duration: reduced ? 1 : 260 }));
  }, [open, reduced, progress]);

  const body = useAnimatedStyle(() => ({ height: contentHeight * progress.get(), opacity: progress.get() }));
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.get() * 180}deg` }] }));

  return (
    <View style={[styles.accordion, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
      >
        {icon ? <MaterialCommunityIcons name={icon} size={20} color={theme.primary} /> : null}
        <Text style={[styles.accordionTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Animated.View style={chevron}>
          <MaterialCommunityIcons name="chevron-down" size={22} color={theme.textMuted} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.accordionBody, body]}>
        <View
          style={styles.accordionContent}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const TABS_PADDING = 4;

const styles = StyleSheet.create({
  check: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  tabs: { flexDirection: 'row', borderRadius: 14, padding: TABS_PADDING },
  highlight: {
    position: 'absolute',
    top: TABS_PADDING,
    bottom: TABS_PADDING,
    left: TABS_PADDING,
    borderRadius: 11,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  tabLabel: { fontSize: 12.5, flexShrink: 1 },
  accordion: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, minHeight: 48 },
  accordionTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  accordionBody: { overflow: 'hidden' },
  accordionContent: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 14, paddingBottom: 14 },
});
