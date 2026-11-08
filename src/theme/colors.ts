export const baseColors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#06B6D4',
  secondaryLight: '#ECFEFF',
  accentPurple: '#8B5CF6',
  accentPink: '#EC4899',
  accentAmber: '#F59E0B',
  accentGreen: '#10B981',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

export const lightTheme = {
  ...baseColors,
  isDark: false,
  /** Texto o ícono encima de `primary`. Cambia con la carrera: algunos acentos llevan texto oscuro. */
  onPrimary: '#FFFFFF',
  /** Fondo de la tarjeta principal de Inicio. */
  hero: '#312E81',
  /** Segundo color de la tarjeta cuando se mezclan dos carreras de facultades distintas. */
  heroAlt: null as string | null,
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#F8FAFC',
  border: '#E2E8F0',
  borderFocus: '#6366F1',
};

export const darkTheme: typeof lightTheme = {
  ...baseColors,
  isDark: true,
  onPrimary: '#FFFFFF',
  hero: '#1E1B4B',
  heroAlt: null,
  background: '#0B0F19',
  cardBg: '#151D30',
  surface: '#111827',
  surfaceElevated: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textLight: '#F8FAFC',
  border: '#27334D',
  borderFocus: '#818CF8',
  primaryLight: 'rgba(99, 102, 241, 0.2)',
  secondaryLight: 'rgba(6, 182, 212, 0.2)',
  successLight: 'rgba(16, 185, 129, 0.2)',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  errorLight: 'rgba(239, 68, 68, 0.2)',
};

export type Theme = typeof lightTheme;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

/** Colores que se ofrecen al crear una materia. */
export const SUBJECT_COLORS = [
  '#6366F1',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#0EA5E9',
];
