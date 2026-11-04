import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

function ShimmerChar({
  char,
  index,
  total,
  progress,
  style,
}: {
  char: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
  style?: StyleProp<TextStyle>;
}) {
  const animated = useAnimatedStyle(() => {
    const distance = Math.abs(progress.get() * (total + 6) - 3 - index);
    return { opacity: distance < 3 ? 1 - (distance / 3) * 0.65 : 0.35 };
  });
  return <Animated.Text style={[style, animated]}>{char}</Animated.Text>;
}

/** Versión móvil de Shimmering Text: un brillo recorre el texto mientras algo se procesa. */
export function ShimmeringText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  // Cada palabra guarda en qué posición del texto empieza, para ondular todo como una sola línea.
  const words = useMemo(() => {
    const list: { word: string; start: number }[] = [];
    let offset = 0;
    for (const word of text.split(' ')) {
      list.push({ word, start: offset });
      offset += word.length + 1;
    }
    return list;
  }, [text]);

  useEffect(() => {
    if (reduced) return;
    progress.set(withRepeat(withTiming(1, { duration: 1700, easing: Easing.linear }), -1));
  }, [progress, reduced]);

  if (reduced) return <Text style={style}>{text}</Text>;

  return (
    <View style={styles.wrap} accessible accessibilityRole="text" accessibilityLabel={text}>
      {words.map(({ word, start }) => (
        <View key={start} style={styles.word}>
          {word.split('').map((char, c) => (
            <ShimmerChar
              key={c}
              char={char}
              index={start + c}
              total={text.length}
              progress={progress}
              style={style}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Versión móvil de Typing Text: revela la respuesta del tutor poco a poco. */
export function TypingText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const step = Math.max(1, Math.ceil(text.length / 180));
    const timer = setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          clearInterval(timer);
          return current;
        }
        return current + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [text, reduced]);

  return <Text style={style}>{reduced ? text : text.slice(0, count)}</Text>;
}

const PARTICLE_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

function Particle({
  angle,
  distance,
  color,
  size,
  delay,
  progress,
}: {
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  progress: SharedValue<number>;
}) {
  const animated = useAnimatedStyle(() => {
    const p = Math.max(0, progress.get() - delay) / (1 - delay);
    const eased = 1 - (1 - p) * (1 - p);
    return {
      opacity: p <= 0 ? 0 : 1 - p * p,
      transform: [
        { translateX: Math.cos(angle) * distance * eased },
        // La gravedad hace caer las chispas al final del recorrido.
        { translateY: Math.sin(angle) * distance * eased + 90 * p * p },
        { scale: 1 - p * 0.5 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animated,
      ]}
    />
  );
}

/** Versión móvil de Fireworks Background: una explosión de chispas al aprobar un quiz. */
export function Fireworks({ active, count = 36 }: { active: boolean; count?: number }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (i / count) * Math.PI * 2,
        distance: 80 + ((i * 37) % 90),
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 6 + (i % 3) * 2,
        delay: (i % 4) * 0.05,
      })),
    [count]
  );

  useEffect(() => {
    if (!active || reduced) return;
    progress.set(0);
    progress.set(withDelay(150, withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) })));
  }, [active, reduced, progress]);

  if (reduced) return null;

  return (
    <View pointerEvents="none" style={styles.fireworks}>
      {particles.map((p) => (
        <Particle key={p.id} {...p} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 5 },
  word: { flexDirection: 'row' },
  fireworks: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
});
