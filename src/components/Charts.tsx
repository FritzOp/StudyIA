import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import type { DayActivity, QuizPoint } from '@/lib/progress';

// Una serie por gráfica: el título dice qué se ve, así que no hay leyenda.
// Las marcas usan el primario (validado en claro y oscuro); los textos, colores de texto.

const PLOT_HEIGHT = 112;
const BAR_MAX_WIDTH = 24;

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function describeDay(day: DayActivity): string {
  if (day.total === 0) return `${day.longLabel} · sin actividad`;
  const parts = [
    day.byType.material && plural(day.byType.material, 'apunte', 'apuntes'),
    day.byType.flashcards && plural(day.byType.flashcards, 'repaso', 'repasos'),
    day.byType.quiz && plural(day.byType.quiz, 'quiz', 'quizzes'),
  ].filter(Boolean);
  return `${day.longLabel} · ${parts.join(', ')}`;
}

/** Vista de tabla: la misma información sin depender de la gráfica. */
function DataTable({ rows }: { rows: { label: string; value: string }[] }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.table, { borderColor: theme.border }]}>
      {rows.map((row, i) => (
        <View
          key={`${row.label}-${i}`}
          style={[styles.tableRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
        >
          <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>{row.label}</Text>
          <Text style={[styles.tableValue, { color: theme.textPrimary }]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function TableToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onToggle} style={styles.toggle}>
      <Text style={[styles.toggleText, { color: theme.primary }]}>{open ? 'Ver gráfica' : 'Ver como tabla'}</Text>
    </Pressable>
  );
}

function Bar({ value, max, index, selected }: { value: number; max: number; index: number; selected: boolean }) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const target = value === 0 ? 0 : Math.max(4, (value / max) * PLOT_HEIGHT);
  const height = useSharedValue(reduced ? target : 0);

  useEffect(() => {
    height.set(reduced ? target : withDelay(index * 40, withTiming(target, { duration: 450 })));
  }, [target, index, reduced, height]);

  const animated = useAnimatedStyle(() => ({ height: height.get() }));
  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: theme.primary, opacity: selected ? 1 : 0.45 },
        animated,
      ]}
    />
  );
}

/** Columnas de actividad diaria. Tocar una columna muestra su detalle. */
export function WeeklyActivityChart({ days }: { days: DayActivity[] }) {
  const { theme } = useTheme();
  // Abre en el último día con actividad, para que el detalle diga algo útil desde el inicio.
  const [selected, setSelected] = useState(() => {
    const lastActive = days.map((d) => d.total > 0).lastIndexOf(true);
    return lastActive >= 0 ? lastActive : days.length - 1;
  });
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...days.map((d) => d.total));
  const day = days[Math.min(selected, days.length - 1)];
  const total = days.reduce((sum, d) => sum + d.total, 0);

  return (
    <View style={styles.chart}>
      <View style={styles.chartHeader}>
        <Text style={[styles.detail, { color: theme.textSecondary }]} numberOfLines={2}>
          {describeDay(day)}
        </Text>
        <TableToggle open={asTable} onToggle={() => setAsTable((v) => !v)} />
      </View>

      {asTable ? (
        <DataTable rows={days.map((d) => ({ label: d.longLabel, value: plural(d.total, 'actividad', 'actividades') }))} />
      ) : (
        <View
          accessible={false}
          style={styles.plotRow}
        >
          <View style={[styles.yAxis, { height: PLOT_HEIGHT }]}>
            <Text style={[styles.tick, { color: theme.textMuted }]}>{max}</Text>
            <Text style={[styles.tick, { color: theme.textMuted }]}>0</Text>
          </View>
          <View style={styles.flex}>
            <View style={[styles.plot, { height: PLOT_HEIGHT }]}>
              <View style={[styles.gridTop, { backgroundColor: theme.border }]} />
              <View style={[styles.baseline, { backgroundColor: theme.border }]} />
              {days.map((d, i) => (
                <Pressable
                  key={d.longLabel}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.longLabel}: ${plural(d.total, 'actividad', 'actividades')}`}
                  accessibilityState={{ selected: i === selected }}
                  onPress={() => setSelected(i)}
                  style={styles.slot}
                >
                  {i === selected && d.total > 0 ? (
                    <Text style={[styles.cap, { color: theme.textPrimary }]}>{d.total}</Text>
                  ) : null}
                  <Bar value={d.total} max={max} index={i} selected={i === selected} />
                </Pressable>
              ))}
            </View>
            <View style={styles.xAxis}>
              {days.map((d, i) => (
                <Text
                  key={d.longLabel}
                  style={[
                    styles.xLabel,
                    { color: i === selected ? theme.textPrimary : theme.textMuted, fontWeight: i === selected ? '800' : '600' },
                  ]}
                >
                  {d.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {total === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          Aún no hay actividad esta semana. Sube un apunte o repasa flashcards para verla aquí.
        </Text>
      ) : null}
    </View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const QUIZ_HEIGHT = 132;
const PAD = { top: 10, bottom: 10, left: 4, right: 10 };
const Y_TICKS = [0, 50, 100];
const PASSING = 60;

/** Línea con los últimos resultados de quiz. Tocar un punto muestra su detalle. */
export function QuizTrendChart({ points }: { points: QuizPoint[] }) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(points.length - 1);
  const [asTable, setAsTable] = useState(false);
  const draw = useSharedValue(reduced ? 1 : 0);

  const geometry = useMemo(() => {
    const innerW = Math.max(0, width - PAD.left - PAD.right);
    const innerH = QUIZ_HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (score: number) => PAD.top + innerH * (1 - score / 100);
    const coords = points.map((p, i) => ({ x: x(i), y: y(p.score) }));
    const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    let length = 0;
    for (let i = 1; i < coords.length; i++) {
      length += Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
    }
    return { coords, d, length, y, slotWidth: points.length ? innerW / points.length : 0 };
  }, [points, width]);

  useEffect(() => {
    if (width === 0 || reduced) return;
    draw.set(0);
    draw.set(withTiming(1, { duration: 700 }));
  }, [width, points.length, reduced, draw]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: geometry.length * (1 - draw.get()),
  }));

  if (points.length === 0) {
    return (
      <Text style={[styles.empty, { color: theme.textMuted }]}>
        Haz tu primer quiz para ver aquí cómo evolucionan tus resultados.
      </Text>
    );
  }

  const point = points[Math.min(selected, points.length - 1)];

  return (
    <View style={styles.chart}>
      <View style={styles.chartHeader}>
        <Text style={[styles.detail, { color: theme.textSecondary }]} numberOfLines={2}>
          {`${point.label} · ${point.title} · `}
          <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{point.score} %</Text>
        </Text>
        <TableToggle open={asTable} onToggle={() => setAsTable((v) => !v)} />
      </View>

      {asTable ? (
        <DataTable rows={points.map((p) => ({ label: `${p.label} · ${p.title}`, value: `${p.score} %` }))} />
      ) : (
        <View style={styles.plotRow}>
          <View style={[styles.yAxis, { height: QUIZ_HEIGHT, paddingVertical: PAD.top - 7 }]}>
            {[...Y_TICKS].reverse().map((t) => (
              <Text key={t} style={[styles.tick, { color: theme.textMuted }]}>
                {t}
              </Text>
            ))}
          </View>
          <View style={styles.flex} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {width > 0 ? (
              <>
                <Svg width={width} height={QUIZ_HEIGHT}>
                  {Y_TICKS.map((t) => (
                    <Line
                      key={t}
                      x1={0}
                      x2={width}
                      y1={geometry.y(t)}
                      y2={geometry.y(t)}
                      stroke={theme.border}
                      strokeWidth={1}
                    />
                  ))}
                  <Line
                    x1={0}
                    x2={width}
                    y1={geometry.y(PASSING)}
                    y2={geometry.y(PASSING)}
                    stroke={theme.textMuted}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                  {points.length > 1 ? (
                    <AnimatedPath
                      d={geometry.d}
                      stroke={theme.primary}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={geometry.length}
                      animatedProps={lineProps}
                    />
                  ) : null}
                  {geometry.coords.map((c, i) => (
                    <Circle
                      key={i}
                      cx={c.x}
                      cy={c.y}
                      r={i === selected ? 6 : 4}
                      fill={theme.primary}
                      stroke={theme.cardBg}
                      strokeWidth={2}
                    />
                  ))}
                </Svg>
                <Text
                  style={[
                    styles.passLabel,
                    { color: theme.textMuted, top: geometry.y(PASSING) - 16 },
                  ]}
                >
                  Aprobado 60 %
                </Text>
                {/* Zonas táctiles más anchas que los puntos. */}
                <View style={StyleSheet.absoluteFill}>
                  {points.map((p, i) => (
                    <Pressable
                      key={i}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.label}, ${p.title}: ${p.score} por ciento`}
                      accessibilityState={{ selected: i === selected }}
                      onPress={() => setSelected(i)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: geometry.coords[i].x - geometry.slotWidth / 2,
                        width: Math.max(geometry.slotWidth, 32),
                      }}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chart: { gap: 10 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 34 },
  detail: { flex: 1, fontSize: 12.5, lineHeight: 17 },
  toggle: { paddingVertical: 4 },
  toggleText: { fontSize: 12, fontWeight: '800' },
  plotRow: { flexDirection: 'row', gap: 6 },
  yAxis: { width: 22, justifyContent: 'space-between', alignItems: 'flex-end' },
  tick: { fontSize: 10.5, fontVariant: ['tabular-nums'] },
  plot: { flexDirection: 'row', alignItems: 'flex-end' },
  gridTop: { position: 'absolute', top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },
  baseline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 },
  slot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '62%',
    maxWidth: BAR_MAX_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cap: { fontSize: 11.5, fontWeight: '800', marginBottom: 3, fontVariant: ['tabular-nums'] },
  xAxis: { flexDirection: 'row', marginTop: 6 },
  xLabel: { flex: 1, textAlign: 'center', fontSize: 11 },
  passLabel: { position: 'absolute', right: 2, fontSize: 10.5, fontWeight: '600' },
  empty: { fontSize: 12.5, lineHeight: 18 },
  table: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, gap: 10 },
  tableLabel: { flex: 1, fontSize: 12.5 },
  tableValue: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
