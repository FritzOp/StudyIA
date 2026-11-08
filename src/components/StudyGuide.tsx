import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GlossaryText } from '@/components/GlossaryText';
import { Accordion, AnimatedEntrance } from '@/components/motion';
import { Banner, Card, type IconName } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { careerInfo } from '@/lib/careers';
import type { StudyGuide } from '@/services/ai/types';

/** Total del plan en texto: «45 min» o «1 h 20 min». */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** Secciones de la guía de estudio que la IA prepara para cada apunte. */
export function StudyGuideView({
  guide,
  careers,
  materialId,
  terms,
}: {
  guide: StudyGuide;
  careers: string[];
  materialId: string;
  /** Palabras que se resaltan: glosario, conceptos clave y palabras difíciles. */
  terms: string[];
}) {
  const { theme } = useTheme();
  const linked = (text: string, style: object) => (
    <GlossaryText text={text} terms={terms} materialId={materialId} style={style} />
  );
  const totalMinutes = guide.studyPlan.reduce((sum, step) => sum + step.minutes, 0);
  const careerIcon = careers.length > 0 ? careerInfo(careers[0]).icon : 'school-outline';

  return (
    <View style={styles.root}>
      {guide.explanation ? (
        <AnimatedEntrance>
          <Card style={styles.card}>
            <Header icon="lightbulb-on-outline" title="Explicación sencilla" />
            {linked(guide.explanation, [styles.body, { color: theme.textSecondary }])}
          </Card>
        </AnimatedEntrance>
      ) : null}

      {guide.glossary.length > 0 ? (
        <Accordion title={`Glosario · ${guide.glossary.length} términos`} icon="book-alphabet" defaultOpen>
          <View style={styles.list}>
            {guide.glossary.map((item) => (
              <Pressable
                key={item.term}
                accessibilityRole="link"
                accessibilityHint="Abre el significado y el contexto de este término"
                onPress={() => router.push({ pathname: '/termino', params: { materialId, term: item.term } })}
                style={[styles.term, { borderLeftColor: theme.primary }]}
              >
                <View style={styles.termHeader}>
                  <Text style={[styles.termName, { color: theme.textPrimary }]}>{item.term}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={theme.textMuted} />
                </View>
                <Text style={[styles.termMeaning, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.meaning}
                </Text>
              </Pressable>
            ))}
          </View>
        </Accordion>
      ) : null}

      {guide.studyPlan.length > 0 ? (
        <Accordion
          title={`Plan de estudio · ${formatMinutes(totalMinutes)}`}
          icon="calendar-check-outline"
          defaultOpen
        >
          <View style={styles.list}>
            {guide.studyPlan.map((step, index) => (
              <View key={`${index}-${step.step}`} style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.stepNumberText, { color: theme.primary }]}>{index + 1}</Text>
                </View>
                <View style={styles.stepBody}>{linked(step.step, [styles.stepText, { color: theme.textSecondary }])}</View>
                <Text style={[styles.stepMinutes, { color: theme.textMuted }]}>{step.minutes} min</Text>
              </View>
            ))}
          </View>
        </Accordion>
      ) : null}

      {guide.careerConnection ? (
        <Card style={styles.card}>
          <Header
            icon={careerIcon as IconName}
            title={careers.length > 1 ? 'Para tus carreras' : 'Para tu carrera'}
            subtitle={careers.join(' · ') || undefined}
          />
          {linked(guide.careerConnection, [styles.body, { color: theme.textSecondary }])}
        </Card>
      ) : null}

      {guide.alternatives.length > 0 ? (
        <Accordion title="Otras formas de entenderlo" icon="swap-horizontal-circle-outline">
          <Bullets items={guide.alternatives} render={linked} />
        </Accordion>
      ) : null}

      {guide.deeper.length > 0 ? (
        <Accordion title="Para saber más" icon="telescope">
          <View style={styles.list}>
            <Banner
              tone="info"
              icon="information-outline"
              title="Esto no viene de tu apunte"
              message="Lo aporta StudyIA para ampliar el tema. Contrástalo con tu docente o tus fuentes."
            />
            <Bullets items={guide.deeper} render={linked} />
          </View>
        </Accordion>
      ) : null}

      {guide.recommendations.length > 0 ? (
        <Accordion title="Recomendaciones" icon="star-shooting-outline">
          <Bullets items={guide.recommendations} render={linked} />
        </Accordion>
      ) : null}
    </View>
  );
}

function Header({ icon, title, subtitle }: { icon: IconName; title: string; subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.header}>
      <View style={[styles.headerIcon, { backgroundColor: theme.primaryLight }]}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Bullets({
  items,
  render,
}: {
  items: string[];
  render: (text: string, style: object) => React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={styles.bulletBody}>{render(item, [styles.bulletText, { color: theme.textSecondary }])}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  flex: { flex: 1 },
  card: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  body: { fontSize: 14.5, lineHeight: 22 },
  list: { gap: 10 },
  term: { borderLeftWidth: 3, paddingLeft: 10, gap: 2 },
  termHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  termName: { flex: 1, fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
  termMeaning: { fontSize: 13.5, lineHeight: 20 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 12.5, fontWeight: '800' },
  stepBody: { flex: 1, paddingTop: 3 },
  stepText: { fontSize: 13.5, lineHeight: 20 },
  stepMinutes: { fontSize: 12, fontWeight: '700', paddingTop: 4 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletBody: { flex: 1 },
  bulletText: { fontSize: 13.5, lineHeight: 20 },
});
