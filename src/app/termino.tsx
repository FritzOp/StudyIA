import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { GlossaryText } from '@/components/GlossaryText';
import { AnimatedEntrance, AnimatedPressable, RippleButton, ShimmeringText, TypingText } from '@/components/motion';
import { Banner, Card, Screen, SectionTitle } from '@/components/ui';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import { useMaterial, useMaterials, useProfile } from '@/hooks/useStudyData';
import { activeCareers } from '@/lib/careers';
import { containsTerm, definitionFromText, sameTerm, termContexts } from '@/lib/glossary';
import { explainWithAi } from '@/services/ai/remoteGenerator';

/** Significado de un término del glosario y las frases donde aparece. */
export default function TermScreen() {
  const { materialId, term } = useLocalSearchParams<{ materialId: string; term: string }>();
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const material = useMaterial(materialId);
  const materials = useMaterials();
  const profile = useProfile();
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const entry = term ? material?.guide?.glossary.find((g) => sameTerm(g.term, term)) : undefined;
  // Si la IA no lo definió (por ejemplo, un concepto clave), se busca la definición en el apunte.
  const fromNotes =
    !entry && term && material
      ? (definitionFromText(material.sourceText, term) ?? definitionFromText(material.summary, term))
      : null;
  const highlight = useMemo(() => (term ? [term] : []), [term]);

  // Contexto: primero tus propias notas, luego el resumen y la explicación de la guía.
  const contexts = useMemo(() => {
    if (!material || !term) return [];
    const sources: { label: string; icon: 'text-long' | 'text-box-outline' | 'lightbulb-on-outline'; text?: string | null }[] = [
      { label: 'En tu apunte', icon: 'text-long', text: material.sourceText },
      { label: 'En el resumen', icon: 'text-box-outline', text: material.summary },
      { label: 'En la explicación', icon: 'lightbulb-on-outline', text: material.guide?.explanation },
    ];
    const seen = new Set<string>();
    return sources
      .map((source) => ({
        ...source,
        sentences: termContexts(source.text, term).filter((s) => !seen.has(s) && seen.add(s)),
      }))
      .filter((source) => source.sentences.length > 0);
  }, [material, term]);

  const otherMaterials = useMemo(
    () =>
      term
        ? materials.filter(
            (m) =>
              m.id !== materialId &&
              (containsTerm(m.sourceText, term) ||
                containsTerm(m.summary, term) ||
                m.guide?.glossary.some((g) => sameTerm(g.term, term)))
          )
        : [],
    [materials, materialId, term]
  );

  const explain = async () => {
    if (!material || !term) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const context = [material.summary, material.sourceText].filter(Boolean).join('\n\n');
      setAnswer(
        await explainWithAi({
          question: `Explícame qué significa «${term}» en este tema, con un ejemplo concreto.`,
          title: material.title,
          context,
          careers: activeCareers(profile),
          semester: profile?.semester,
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener la explicación.');
    } finally {
      setLoading(false);
    }
  };

  if (!material || !term) return <Screen title="Término" back>{null}</Screen>;

  return (
    <Screen title={term} subtitle={material.title} back>
      <AnimatedEntrance type="scale">
        <Card style={styles.meaning}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name="book-alphabet" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              {entry ? 'SIGNIFICADO' : fromNotes ? 'SEGÚN TU APUNTE' : 'CONCEPTO CLAVE'}
            </Text>
          </View>
          {entry || fromNotes ? (
            <Text selectable style={[styles.meaningText, { color: theme.textPrimary }]}>
              {entry?.meaning ?? fromNotes}
            </Text>
          ) : (
            <Text style={[styles.quoteText, { color: theme.textSecondary }]}>
              Tu apunte no lo define directamente. Mira abajo cómo se usa
              {canUseCloud ? ' o pídele a la IA que te lo explique.' : '.'}
            </Text>
          )}
        </Card>
      </AnimatedEntrance>

      {contexts.length > 0 ? (
        <>
          <SectionTitle title="Contexto" subtitle="Dónde aparece y cómo se usa" />
          {contexts.map((source) => (
            <Card key={source.label} style={styles.context}>
              <View style={styles.header}>
                <MaterialCommunityIcons name={source.icon} size={18} color={theme.primary} />
                <Text style={[styles.sourceLabel, { color: theme.textSecondary }]}>{source.label}</Text>
              </View>
              {source.sentences.map((sentence) => (
                <View key={sentence} style={[styles.quote, { borderLeftColor: theme.primary }]}>
                  <GlossaryText
                    text={sentence}
                    terms={highlight}
                    style={[styles.quoteText, { color: theme.textSecondary }]}
                  />
                </View>
              ))}
            </Card>
          ))}
        </>
      ) : (
        <Banner
          tone="info"
          icon="information-outline"
          title="No aparece literalmente en tu apunte"
          message="La IA lo incluyó porque ayuda a entender el tema."
        />
      )}

      <Card style={styles.context}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="creation" size={18} color={theme.primary} />
          <Text style={[styles.sourceLabel, { color: theme.textSecondary }]}>¿Aún no queda claro?</Text>
        </View>
        {canUseCloud ? (
          <>
            <RippleButton
              label="Explícamelo con un ejemplo"
              icon="lightbulb-on-outline"
              variant="soft"
              loading={loading}
              onPress={explain}
            />
            {loading ? (
              <ShimmeringText text="Preparando el ejemplo" style={[styles.thinking, { color: theme.primary }]} />
            ) : null}
            {error ? <Banner tone="error" icon="alert-circle-outline" title={error} /> : null}
            {answer ? (
              <TypingText key={answer} text={answer} style={[styles.quoteText, { color: theme.textSecondary }]} />
            ) : null}
          </>
        ) : (
          <Text style={[styles.quoteText, { color: theme.textMuted }]}>
            La IA puede explicártelo con un ejemplo cuando tengas conexión y una cuenta iniciada.
          </Text>
        )}
      </Card>

      {otherMaterials.length > 0 ? (
        <>
          <SectionTitle title="También aparece en" />
          {otherMaterials.slice(0, 5).map((m) => (
            <AnimatedPressable
              key={m.id}
              scaleTo={0.98}
              onPress={() => router.push({ pathname: '/material/[id]', params: { id: m.id } })}
              style={[styles.other, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            >
              <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.primary} />
              <Text style={[styles.otherTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {m.title}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
            </AnimatedPressable>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meaning: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.6 },
  meaningText: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  context: { gap: 10 },
  sourceLabel: { fontSize: 13, fontWeight: '800' },
  quote: { borderLeftWidth: 3, paddingLeft: 10 },
  quoteText: { fontSize: 14, lineHeight: 21 },
  thinking: { fontSize: 13.5, fontWeight: '700' },
  other: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 52 },
  otherTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
});
