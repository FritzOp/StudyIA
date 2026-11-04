import React, { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View, type DimensionValue, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

function Digit({ digit, height, style }: { digit: number; height: number; style?: StyleProp<TextStyle> }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.set(withSpring(-digit * height, { damping: 18, stiffness: 130 }));
  }, [digit, height, offset]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={animated}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Text key={n} style={[style, { height, lineHeight: height }]}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

/** Versión móvil de Sliding Number: cada dígito rueda hasta su valor con un resorte. */
export function SlidingNumber({
  value,
  suffix = '',
  fontSize = 22,
  color,
  style,
}: {
  value: number;
  suffix?: string;
  fontSize?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const height = Math.round(fontSize * 1.25);
  const textStyle: StyleProp<TextStyle> = [
    { fontSize, color, fontWeight: '800', fontVariant: ['tabular-nums'] },
    style,
  ];
  const digits = String(Math.max(0, Math.round(value))).split('');

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${value}${suffix}`}
    >
      {digits.map((digit, i) => (
        // La clave cuenta desde las unidades para que no salten al ganar un dígito.
        <Digit key={digits.length - i} digit={Number(digit)} height={height} style={textStyle} />
      ))}
      {suffix ? <Text style={[textStyle, { height, lineHeight: height }]}>{suffix}</Text> : null}
    </View>
  );
}

/** Barra de progreso con resorte (como Progress de Animate UI). */
export function ProgressBar({
  value,
  color,
  trackColor,
  height = 6,
  delay = 0,
  style,
}: {
  value: number;
  color: string;
  trackColor: string;
  height?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const width = useSharedValue(reduced ? value : 0);

  useEffect(() => {
    width.set(
      reduced
        ? withTiming(value, { duration: 1 })
        : withDelay(delay, withSpring(value, { damping: 20, stiffness: 90 }))
    );
  }, [value, delay, reduced, width]);

  const animated = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, width.get()))}%` as DimensionValue,
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={[{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[{ height: '100%', borderRadius: height / 2, backgroundColor: color }, animated]} />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Anillo de progreso: el trazo se dibuja hasta el porcentaje. */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 11,
  color,
  trackColor,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? value : 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.set(
      reduced ? withTiming(value, { duration: 1 }) : withTiming(value, { duration: 900 })
    );
  }, [value, reduced, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.max(0, Math.min(100, progress.get())) / 100),
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});
