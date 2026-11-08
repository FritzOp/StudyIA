import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedEntrance, RippleButton } from '@/components/motion';
import { useTheme } from '@/context/ThemeContext';
import { shadows } from '@/theme/colors';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Los íconos de las materias se guardan como texto en SQLite. */
export function asIcon(name: string | null | undefined): IconName {
  return name && name in MaterialCommunityIcons.glyphMap ? (name as IconName) : 'book-open-page-variant';
}

const KEYBOARD_MARGIN = 24;

/** Permite a un Field pedir que lo desplacen hasta quedar por encima del teclado. */
const RevealFieldContext = createContext<() => void>(() => undefined);

/**
 * Scroll con soporte de teclado. El KeyboardAvoidingView que lo envuelve encoge la pantalla y aquí
 * se desplaza el campo activo hasta verlo: Android no lo hace solo con la app de borde a borde.
 */
export function KeyboardScrollView({
  children,
  contentContainerStyle,
}: {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const frameRef = useRef<ComponentRef<typeof View>>(null);
  const offset = useRef(0);
  const keyboardOpen = useRef(false);

  const reveal = useCallback(() => {
    // Se espera a que el contenedor termine de encogerse antes de medir.
    setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !keyboardOpen.current) return;
      input.measureInWindow((_x, y, _width, height) => {
        // Se compara con el marco del scroll, ya encogido por el teclado, y no con la posición del
        // teclado: en Android measureInWindow no cuenta la barra de estado y no coincidirían.
        frameRef.current?.measureInWindow((_fx, frameTop, _fw, frameHeight) => {
          const overflow = y + height + KEYBOARD_MARGIN - (frameTop + frameHeight);
          if (overflow <= 0) return;
          // Si el campo no cabe entero, se prioriza ver su parte superior.
          const delta = Math.min(overflow, y - frameTop - KEYBOARD_MARGIN);
          if (delta > 0) scrollRef.current?.scrollTo({ y: offset.current + delta, animated: true });
        });
      });
    }, 120);
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      keyboardOpen.current = true;
      reveal();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardOpen.current = false;
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [reveal]);

  return (
    <RevealFieldContext.Provider value={reveal}>
      <View ref={frameRef} collapsable={false} style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          style={styles.screen}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          scrollEventThrottle={32}
          onScroll={(event) => {
            offset.current = event.nativeEvent.contentOffset.y;
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </RevealFieldContext.Provider>
  );
}

export function Screen({
  children,
  title,
  subtitle,
  back = false,
  right,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // El KeyboardAvoidingView va en la raíz porque calcula el teclado con su posición en la pantalla.
  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.screen, { backgroundColor: theme.background }]}>
      {title ? (
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 10, backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={10}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={[styles.iconButton, { backgroundColor: theme.surfaceElevated }]}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color={theme.textPrimary} />
            </Pressable>
          ) : null}
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      ) : (
        <View style={{ height: insets.top }} />
      )}
      {scroll ? (
        <KeyboardScrollView contentContainerStyle={[styles.content, { paddingBottom: 28 }, contentStyle]}>
          {children}
        </KeyboardScrollView>
      ) : (
        <View style={[styles.screen, contentStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={styles.headerText}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <AnimatedEntrance type="scale">
      <View style={[styles.empty, { borderColor: theme.border }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.primaryLight }]}>
          <MaterialCommunityIcons name={icon} size={30} color={theme.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>{message}</Text>
        {actionLabel ? (
          <RippleButton label={actionLabel} onPress={onAction} variant="soft" style={styles.emptyAction} />
        ) : null}
      </View>
    </AnimatedEntrance>
  );
}

export function Field({
  label,
  icon,
  error,
  right,
  inputStyle,
  ...input
}: TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string | null;
  right?: ReactNode;
  inputStyle?: TextInputProps['style'];
}) {
  const { theme } = useTheme();
  const reveal = useContext(RevealFieldContext);
  const { onFocus, onContentSizeChange, multiline } = input;
  const handlers = useMemo<Pick<TextInputProps, 'onFocus' | 'onContentSizeChange'>>(
    () => ({
      onFocus: (event) => {
        reveal();
        onFocus?.(event);
      },
      // Un campo de varias líneas crece al escribir: el cursor debe seguir a la vista.
      onContentSizeChange: (event) => {
        if (multiline) reveal();
        onContentSizeChange?.(event);
      },
    }),
    [reveal, onFocus, onContentSizeChange, multiline]
  );
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.surfaceElevated, borderColor: error ? theme.error : theme.border },
        ]}
      >
        {icon ? <MaterialCommunityIcons name={icon} size={20} color={theme.textMuted} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.textPrimary }, inputStyle]}
          {...input}
          {...handlers}
        />
        {right}
      </View>
      {error ? <Text style={[styles.fieldError, { color: theme.error }]}>{error}</Text> : null}
    </View>
  );
}

export function Banner({
  tone,
  icon,
  title,
  message,
  action,
}: {
  tone: 'info' | 'success' | 'warning' | 'error';
  icon: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  const { theme } = useTheme();
  const colors = {
    info: { bg: theme.primaryLight, fg: theme.primary },
    success: { bg: theme.successLight, fg: theme.success },
    warning: { bg: theme.warningLight, fg: theme.warning },
    error: { bg: theme.errorLight, fg: theme.error },
  }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: colors.bg }]} accessibilityRole="alert">
      <MaterialCommunityIcons name={icon} size={20} color={colors.fg} />
      <View style={styles.headerText}>
        <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>{title}</Text>
        {message ? <Text style={[styles.bannerMessage, { color: theme.textSecondary }]}>{message}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Chip({
  label,
  selected,
  color,
  onPress,
}: {
  label: string;
  selected: boolean;
  color?: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const accent = color ?? theme.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accent : theme.cardBg,
          borderColor: selected ? accent : theme.border,
        },
      ]}
    >
      <Text
        style={[styles.chipText, { color: selected ? (color ? '#FFFFFF' : theme.onPrimary) : theme.textSecondary }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { flex: 1 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, ...shadows.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  empty: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 22,
  },
  emptyIcon: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyMessage: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  emptyAction: { marginTop: 6 },
  field: { gap: 5 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  fieldError: { fontSize: 12, fontWeight: '600' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14 },
  bannerTitle: { fontSize: 13, fontWeight: '700' },
  bannerMessage: { fontSize: 12, lineHeight: 17, marginTop: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, minHeight: 38 },
  chipText: { fontSize: 12.5, fontWeight: '700' },
});
