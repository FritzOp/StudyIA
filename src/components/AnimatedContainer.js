import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

/**
 * AnimatedEntrance - Contenedor con animaciones de entrada fluidas tipo animate-ui:
 * fade, slideUp, slideDown, scale, con retardo (delay) o soporte stagger.
 */
export function AnimatedEntrance({
  children,
  type = 'slideUp',
  duration = 450,
  delay = 0,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(type === 'slideUp' ? 24 : type === 'slideDown' ? -24 : 0)).current;
  const scale = useRef(new Animated.Value(type === 'scale' ? 0.88 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 40,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, scale, translateY, opacity]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedPressable - Botón interactivo con retroalimentación háptica visual (scale spring)
 * como en las micro-interacciones de animate-ui.
 */
export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  activeOpacity = 0.9,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * AnimatedPulse - Efecto de pulso suave y continuo para destacar llamadas a la acción (IA).
 */
export function AnimatedPulse({ children, style }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View style={[style, { transform: [{ scale: pulse }] }]}>
      {children}
    </Animated.View>
  );
}
