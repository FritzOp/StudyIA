import React, { type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type Variant = 'primary' | 'soft' | 'danger' | 'ghost';

const RIPPLE_SIZE = 40;

/**
 * Versión móvil de Ripple Button de Animate UI: una onda se expande desde el punto
 * exacto donde se tocó, junto con una escala de resorte en todo el botón.
 */
export function RippleButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const ripple = useSharedValue(1);
  const scale = useSharedValue(1);

  const palette: Record<Variant, { bg: string; fg: string; wave: string }> = {
    primary: { bg: theme.primary, fg: '#FFFFFF', wave: 'rgba(255,255,255,0.35)' },
    soft: { bg: theme.primaryLight, fg: theme.primary, wave: 'rgba(99,102,241,0.25)' },
    danger: { bg: theme.errorLight, fg: theme.error, wave: 'rgba(239,68,68,0.25)' },
    ghost: { bg: 'transparent', fg: theme.textSecondary, wave: 'rgba(100,116,139,0.2)' },
  };
  const colors = palette[variant];
  const isDisabled = disabled || loading;

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const waveStyle = useAnimatedStyle(() => {
    const p = ripple.get();
    return {
      left: x.get() - RIPPLE_SIZE / 2,
      top: y.get() - RIPPLE_SIZE / 2,
      opacity: p >= 1 ? 0 : 1 - p,
      transform: [{ scale: 0.2 + p * 14 }],
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={(event) => {
        x.set(event.nativeEvent.locationX);
        y.set(event.nativeEvent.locationY);
        ripple.set(0);
        ripple.set(withTiming(1, { duration: 550 }));
        scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }));
      }}
      onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 180 }))}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: colors.bg, opacity: isDisabled ? 0.6 : 1 },
          buttonStyle,
          style,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.wave, { backgroundColor: colors.wave }, waveStyle]}
        />
        <View style={styles.content} pointerEvents="none">
          {loading ? (
            <ActivityIndicator size="small" color={colors.fg} />
          ) : icon ? (
            <MaterialCommunityIcons name={icon} size={19} color={colors.fg} />
          ) : null}
          <Text style={[styles.label, { color: colors.fg }]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontWeight: '700', fontSize: 15 },
  wave: { position: 'absolute', width: RIPPLE_SIZE, height: RIPPLE_SIZE, borderRadius: RIPPLE_SIZE / 2 },
});
