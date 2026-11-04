import React, { useEffect, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type EntranceType = 'slideUp' | 'slideDown' | 'scale' | 'fade';

/** Entrada con fade y desplazamiento; `delay` permite escalonar listas. */
export function AnimatedEntrance({
  children,
  type = 'slideUp',
  duration = 420,
  delay = 0,
  style,
}: {
  children: ReactNode;
  type?: EntranceType;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.set(
      withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }))
    );
  }, [delay, duration, progress, reduced]);

  const animated = useAnimatedStyle(() => {
    const p = progress.get();
    const offset = type === 'slideUp' ? 22 : type === 'slideDown' ? -22 : 0;
    return {
      opacity: p,
      transform: [
        { translateY: interpolate(p, [0, 1], [offset, 0]) },
        { scale: type === 'scale' ? interpolate(p, [0, 1], [0.9, 1]) : 1 },
      ],
    };
  });

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Botón con micro-interacción de escala con resorte al presionar. */
export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.96,
  disabled = false,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => scale.set(withSpring(scaleTo, { damping: 15, stiffness: 300 }))}
      onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 180 }))}
      disabled={disabled}
    >
      <Animated.View style={[style, animated, disabled && { opacity: 0.55 }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Pulso suave y continuo para destacar algo que está activo. */
export function AnimatedPulse({
  children,
  style,
  active = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!active || reduced) {
      pulse.set(withTiming(1, { duration: 150 }));
      return;
    }
    pulse.set(
      withRepeat(
        withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1
      )
    );
  }, [active, pulse, reduced]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
