// Catálogo de animaciones. Animate UI (animate-ui.com) es solo para web: depende de Motion,
// Radix/Base UI y shadcn/ui, que requieren el DOM. Aquí se reconstruyen sus efectos con
// Reanimated 4 y react-native-svg para que corran en el hilo de UI del teléfono.
// Todos respetan la opción "reducir movimiento" del sistema (useReducedMotion).
export { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from './Entrance';
export { RippleButton } from './RippleButton';
export { FlipCard } from './FlipCard';
export { ProgressBar, ProgressRing, SlidingNumber } from './Numbers';
export { Accordion, AnimatedCheck, SlidingTabs, type TabItem } from './Controls';
export { Fireworks, ShimmeringText, TypingText } from './Effects';
