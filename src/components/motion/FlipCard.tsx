import React, { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Versión móvil de Flip Card de Animate UI: giro 3D sobre el eje Y.
 * La cara oculta se apaga a los 90° porque backfaceVisibility no es fiable en Android.
 * La tarjeta toma la altura de su cara más alta para que el giro no cambie el diseño.
 */
export function FlipCard({
  front,
  back,
  flipped,
  onPress,
  minHeight = 280,
  style,
  accessibilityLabel,
}: {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onPress?: () => void;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const reduced = useReducedMotion();
  const rotation = useSharedValue(flipped ? 180 : 0);
  const [heights, setHeights] = useState({ front: 0, back: 0 });

  useEffect(() => {
    const target = flipped ? 180 : 0;
    rotation.set(
      reduced ? withTiming(target, { duration: 1 }) : withSpring(target, { damping: 16, stiffness: 110 })
    );
  }, [flipped, reduced, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: rotation.get() < 90 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.get()}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: rotation.get() >= 90 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(rotation.get(), [0, 180], [180, 360])}deg` }],
  }));

  const measure = (face: 'front' | 'back') => (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeights((current) => (current[face] === height ? current : { ...current, [face]: height }));
  };

  const height = Math.max(minHeight, heights.front, heights.back);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Toca para girar la tarjeta"
      style={[{ height }, style]}
    >
      <Animated.View style={[styles.face, frontStyle]} pointerEvents="none">
        <View onLayout={measure('front')} style={{ minHeight }}>
          {front}
        </View>
      </Animated.View>
      <Animated.View style={[styles.face, backStyle]} pointerEvents="none">
        <View onLayout={measure('back')} style={{ minHeight }}>
          {back}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { position: 'absolute', left: 0, right: 0, top: 0 },
});
