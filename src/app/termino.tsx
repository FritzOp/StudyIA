import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { AnimatedEntrance, RippleButton, ShimmeringText } from '@/components/motion';
import { Banner, Card, Screen } from '@/components/ui';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import type { Material } from '@/db/schema';
import { useMaterial, useProfile, useSubject } from '@/hooks/useStudyData';
import { activeCareers } from '@/lib/careers';
import { definitionFromText } from '@/lib/glossary';
import { termWithAi } from '@/services/ai/remoteGenerator';
import { cachedMeaning, meaningFromGuide, rememberMeaning, type TermMeaning } from '@/services/termMeanings';

/** Qué significa una palabra dentro del tema del apunte, con un ejemplo. */
export default function TermScreen() {
  const { materialId, term } = useLocalSearchParams<{ materialId: string; term: string }>();
  const material = useMaterial(materialId);
  if (!material || !term) return <Screen title="Término" back>{null}</Screen>;
  return <TermContent material={material} term={term} />;
}

function TermContent({ material, term }: { material: Material; term: string }) {
  const { theme } = useTheme();
  const { canUseCloud } = useSync();
  const profile = useProfile();
  const subject = useSubject(material.subjectId);
  const fromGuide = meaningFromGuide(material, term);
  const [fetched, setFetched] = useState<TermMeaning | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topic = material.title;

  const ask = useCallback(
    async () => {
      if (!canUseCloud) return;
      setError(null);
      setLoading(true);
      try {
        const value = await termWithAi({
          term,
          title: material.title,
          context: [material.summary, material.sourceText].filter(Boolean).join('\n\n'),
          careers: activeCareers(profile),
          semester: profile?.semester,
        });
        setFetched(value);
        await rememberMeaning(material, term, value);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo obtener el significado.');
      } finally {
        setLoading(false);
      }
    },
    [canUseCloud, material, profile, term]
  );

  // Si la guía ya lo explica, no se gasta IA; si no, se pide una sola vez y se guarda.
  useEffect(() => {
    if (fromGuide) return;
    let active = true;
    cachedMeaning(material.id, term).then((cached) => {
      if (!active) return;
      if (cached) setFetched(cached);
      else ask().catch(() => undefined);
    });
    return () => {
      active = false;
    };
    // Solo al abrir la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lo último pedido a la IA («de otra forma») tiene prioridad sobre el glosario.
  const value = fetched ?? fromGuide;
  // Sin IA disponible, la mejor aproximación es la frase del apunte que lo define.
  const offline = !value && !loading && !canUseCloud
    ? (definitionFromText(material.sourceText, term) ?? definitionFromText(material.summary, term))
    : null;

  return (
    <Screen title={term} subtitle={subject ? `${topic} · ${subject.name}` : topic} back>
      <AnimatedEntrance type="scale">
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name="book-alphabet" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.label, { color: theme.textMuted }]}>QUÉ SIGNIFICA EN ESTE TEMA</Text>
          </View>

          {value ? (
            <Text selectable style={[styles.meaning, { color: theme.textPrimary }]}>
              {value.meaning}
            </Text>
          ) : loading ? (
            <ShimmeringText
              text={`Explicando «${term}» dentro de ${topic}`}
              style={[styles.loading, { color: theme.primary }]}
            />
          ) : offline ? (
            <Text selectable style={[styles.meaning, { color: theme.textPrimary }]}>
              {offline}
            </Text>
          ) : (
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              {canUseCloud
                ? 'No se pudo preparar el significado.'
                : 'StudyIA te explica cada palabra dentro del tema cuando tienes conexión y una cuenta iniciada.'}
            </Text>
          )}
        </Card>
      </AnimatedEntrance>

      {offline ? (
        <Text style={[styles.note, { color: theme.textMuted }]}>
          Con conexión y una cuenta iniciada, StudyIA te lo explica con un ejemplo del tema.
        </Text>
      ) : null}

      {value?.example ? (
        <AnimatedEntrance delay={80}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.icon, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.label, { color: theme.textMuted }]}>EJEMPLO</Text>
            </View>
            <Text selectable style={[styles.body, { color: theme.textSecondary }]}>
              {value.example}
            </Text>
          </Card>
        </AnimatedEntrance>
      ) : null}

      {error ? <Banner tone="error" icon="alert-circle-outline" title={error} /> : null}

      {canUseCloud && !loading && (value || error) ? (
        <RippleButton
          label={value ? 'Explícamelo de otra forma' : 'Intentar de nuevo'}
          icon="creation"
          variant="soft"
          onPress={() => ask()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.6 },
  meaning: { fontSize: 17, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 23 },
  loading: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
});
