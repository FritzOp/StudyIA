import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Accordion, AnimatedEntrance, SlidingTabs } from '@/components/motion';
import { asIcon, Card, EmptyState, Field, Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import {
  uniguajiraCampuses,
  uniguajiraDiplomas,
  uniguajiraFaculties,
  uniguajiraInstitutionalInfo,
  uniguajiraPostgraduates,
} from '@/data/uniguajiraData';

type Tab = 'pregrados' | 'posgrados' | 'diplomados' | 'sedes';

const POSTGRADUATE_COLOR: Record<string, string> = {
  Doctorado: '#8B5CF6',
  Maestría: '#6366F1',
};

export default function UniversityScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('pregrados');
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const faculties = useMemo(
    () =>
      uniguajiraFaculties
        .map((faculty) => ({
          ...faculty,
          programs: faculty.programs.filter(
            (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
          ),
        }))
        .filter((faculty) => faculty.programs.length > 0),
    [q]
  );
  const postgraduates = useMemo(
    () =>
      uniguajiraPostgraduates.filter((p) =>
        [p.name, p.faculty, p.type].some((field) => field.toLowerCase().includes(q))
      ),
    [q]
  );
  const diplomas = useMemo(
    () =>
      uniguajiraDiplomas.filter((d) =>
        [d.name, d.area, d.desc].some((field) => field.toLowerCase().includes(q))
      ),
    [q]
  );

  return (
    <Screen title="Universidad de La Guajira" subtitle={uniguajiraInstitutionalInfo.slogan} back>
      <SlidingTabs<Tab>
        tabs={[
          { id: 'pregrados', label: 'Pregrado' },
          { id: 'posgrados', label: 'Posgrado' },
          { id: 'diplomados', label: 'Diplomados' },
          { id: 'sedes', label: 'Sedes' },
        ]}
        value={tab}
        onChange={(next) => {
          setTab(next);
          setSearch('');
        }}
      />

      {tab !== 'sedes' ? (
        <Field label="Buscar" icon="magnify" placeholder={`Buscar en ${tab}...`} value={search} onChangeText={setSearch} />
      ) : null}

      {tab === 'pregrados' ? (
        <View style={styles.list}>
          {faculties.map((faculty, index) => (
            <AnimatedEntrance key={faculty.id} delay={index * 40} duration={280}>
              <Accordion title={faculty.name} icon={asIcon(faculty.icon)} defaultOpen={!!q}>
                <Text style={[styles.description, { color: theme.textMuted }]}>{faculty.description}</Text>
                {faculty.programs.map((program) => (
                  <View key={program.id} style={[styles.program, { borderTopColor: theme.border }]}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{program.name}</Text>
                    <Text style={[styles.meta, { color: theme.textMuted }]}>
                      {program.code} · {program.degree} · {program.credits} créditos
                    </Text>
                  </View>
                ))}
              </Accordion>
            </AnimatedEntrance>
          ))}
          {faculties.length === 0 ? <NoResults search={search} /> : null}
        </View>
      ) : null}

      {tab === 'posgrados' ? (
        <View style={styles.list}>
          {postgraduates.map((p) => {
            const color = POSTGRADUATE_COLOR[p.type] ?? '#06B6D4';
            return (
              <Card key={p.id} style={styles.card}>
                <View style={[styles.tag, { backgroundColor: `${color}20` }]}>
                  <Text style={[styles.tagText, { color }]}>{p.type}</Text>
                </View>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{p.name}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>{p.desc}</Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>{p.faculty}</Text>
              </Card>
            );
          })}
          {postgraduates.length === 0 ? <NoResults search={search} /> : null}
        </View>
      ) : null}

      {tab === 'diplomados' ? (
        <View style={styles.list}>
          {diplomas.map((d) => (
            <Card key={d.id} style={styles.card}>
              <View style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.tagText, { color: theme.primary }]}>
                  {d.area} · {d.hours} horas
                </Text>
              </View>
              <Text style={[styles.name, { color: theme.textPrimary }]}>{d.name}</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>{d.desc}</Text>
              <Text style={[styles.meta, { color: theme.textMuted }]}>{d.faculty}</Text>
            </Card>
          ))}
          {diplomas.length === 0 ? <NoResults search={search} /> : null}
        </View>
      ) : null}

      {tab === 'sedes' ? (
        <View style={styles.list}>
          <Accordion title="Origen y reconocimiento" icon="history" defaultOpen>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Fundación: {uniguajiraInstitutionalInfo.foundation}.{'\n'}
              Reconocimiento: {uniguajiraInstitutionalInfo.ministerialRecognition}.
            </Text>
          </Accordion>
          <Accordion title="Misión institucional" icon="compass-outline">
            <Text style={[styles.description, { color: theme.textSecondary }]}>{uniguajiraInstitutionalInfo.mission}</Text>
          </Accordion>
          <Accordion title="Visión 2030" icon="eye-outline">
            <Text style={[styles.description, { color: theme.textSecondary }]}>{uniguajiraInstitutionalInfo.vision2030}</Text>
          </Accordion>
          <Accordion title="Valores rectores" icon="shield-check-outline">
            {uniguajiraInstitutionalInfo.coreValues.map((value) => (
              <View key={value} style={styles.value}>
                <MaterialCommunityIcons name="check-circle" size={16} color={theme.primary} />
                <Text style={[styles.valueText, { color: theme.textSecondary }]}>{value}</Text>
              </View>
            ))}
          </Accordion>
          {uniguajiraCampuses.map((campus) => (
            <Card key={campus.id} style={styles.card}>
              <View style={styles.campus}>
                <MaterialCommunityIcons name={asIcon(campus.icon)} size={22} color={theme.primary} />
                <View style={styles.flex}>
                  <Text style={[styles.name, { color: theme.textPrimary }]}>{campus.name}</Text>
                  <Text style={[styles.meta, { color: theme.primary }]}>{campus.type}</Text>
                </View>
              </View>
              <Text style={[styles.meta, { color: theme.textMuted }]}>{campus.address}</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>{campus.description}</Text>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function NoResults({ search }: { search: string }) {
  return <EmptyState icon="magnify" title="Sin resultados" message={`Nada coincide con "${search}".`} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: 10 },
  card: { gap: 6 },
  program: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 9, gap: 2 },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 11.5 },
  description: { fontSize: 13, lineHeight: 18 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: '700' },
  value: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 3 },
  valueText: { flex: 1, fontSize: 13 },
  campus: { flexDirection: 'row', alignItems: 'center', gap: 9 },
});
