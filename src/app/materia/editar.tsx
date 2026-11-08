import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RippleButton } from '@/components/motion';
import { asIcon, Card, Chip, Field, Screen } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { subjectsRepo } from '@/db/repositories/subjects';
import { useProfile, useSubject, useSubjects } from '@/hooks/useStudyData';
import { activeCareers, semesterNumber } from '@/lib/careers';
import { searchSubjects, suggestSubjects, type SubjectSuggestion } from '@/lib/subjects';
import { SUBJECT_COLORS } from '@/theme/colors';

/** Crea una materia o, si recibe id, edita la existente. */
export default function EditSubjectScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useSubject(id ?? '');

  // Se monta el formulario cuando ya cargó la materia, para iniciar los campos con sus datos.
  if (id && !existing) return <Screen title="Editar materia" back>{null}</Screen>;

  return <SubjectForm key={existing?.id ?? 'new'} existing={existing} />;
}

function SubjectForm({ existing }: { existing: ReturnType<typeof useSubject> }) {
  const userId = useUserId();
  const { theme } = useTheme();
  const [name, setName] = useState(existing?.name ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [color, setColor] = useState(existing?.color ?? SUBJECT_COLORS[0]);
  const [icon, setIcon] = useState(existing?.icon ?? 'book-open-page-variant');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const profile = useProfile();
  const careers = useMemo(() => activeCareers(profile), [profile]);
  const semester = semesterNumber(profile?.semester);
  const subjects = useSubjects();
  // Nombre elegido de la lista: mientras no se edite, la lista desplegable queda cerrada.
  const [picked, setPicked] = useState<string | null>(null);
  const query = name.trim();

  // Sin texto: materias de la carrera, del semestre actual hacia afuera.
  const suggestions = useMemo(
    () => suggestSubjects(careers, subjects.map((s) => s.name), 12, semester),
    [careers, subjects, semester]
  );
  // Al escribir: lista desplegable que filtra en todos los planes y en el catálogo.
  const matches = useMemo(
    () => (query && query !== picked ? searchSubjects(query, careers, 8) : []),
    [query, picked, careers]
  );

  const suggestionsLabel =
    careers.length === 0
      ? 'Materias sugeridas'
      : `Sugeridas para ${careers.join(' y ')}${profile?.semester ? ` · ${profile.semester.toLowerCase()}` : ''}`;

  const pick = (s: SubjectSuggestion) => {
    setName(s.name);
    setCode(s.code);
    if (s.desc) setDescription(s.desc);
    setIcon(s.icon);
    setPicked(s.name);
    setNameError(null);
    Keyboard.dismiss();
  };

  const originOf = (s: SubjectSuggestion) =>
    s.semester ? `${s.source} · ${s.semester}.º semestre` : `Catálogo general · ${s.source}`;

  const save = async () => {
    if (!name.trim()) {
      setNameError('El nombre de la materia es obligatorio.');
      return;
    }
    setSaving(true);
    const input = { name: name.trim(), code: code.trim(), description: description.trim(), color, icon };
    if (existing) await subjectsRepo.update(existing.id, input);
    else await subjectsRepo.create(userId, input);
    setSaving(false);
    router.back();
  };

  return (
    <Screen title={existing ? 'Editar materia' : 'Nueva materia'} back>
      <Field
        label="Nombre"
        icon="book-outline"
        placeholder={`Escribe para buscar, ej. ${suggestions[0]?.name ?? 'Bases de Datos'}`}
        value={name}
        error={nameError}
        onChangeText={(text) => {
          setName(text);
          setNameError(null);
        }}
      />

      {matches.length > 0 ? (
        <Card style={styles.dropdown}>
          {matches.map((s, index) => (
            <Pressable
              key={`${s.source}-${s.name}`}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${originOf(s)}`}
              onPress={() => pick(s)}
              style={({ pressed }) => [
                styles.option,
                index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
                pressed && { backgroundColor: theme.surfaceElevated },
              ]}
            >
              <MaterialCommunityIcons name={asIcon(s.icon)} size={20} color={theme.primary} />
              <View style={styles.optionText}>
                <Text style={[styles.optionName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={[styles.optionMeta, { color: theme.textMuted }]} numberOfLines={1}>
                  {originOf(s)}
                </Text>
              </View>
              <MaterialCommunityIcons name="arrow-top-left" size={18} color={theme.textMuted} />
            </Pressable>
          ))}
        </Card>
      ) : null}

      {!query && suggestions.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{suggestionsLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.row}
          >
            {suggestions.map((s) => (
              <Chip key={`${s.source}-${s.name}`} label={s.name} selected={false} onPress={() => pick(s)} />
            ))}
          </ScrollView>
          <Text style={[styles.note, { color: theme.textMuted }]}>
            Según un plan de estudios de referencia; el oficial de tu programa puede variar.
          </Text>
        </View>
      ) : null}

      <Field label="Código (opcional)" icon="identifier" placeholder="Ej. SIS-301" value={code} onChangeText={setCode} />
      <Field
        label="Descripción (opcional)"
        placeholder="¿De qué trata la materia?"
        value={description}
        onChangeText={setDescription}
        multiline
        inputStyle={styles.multiline}
      />

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
        <View style={styles.colors}>
          {SUBJECT_COLORS.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: color === c }}
              onPress={() => setColor(c)}
              style={[styles.color, { backgroundColor: c }]}
            >
              {color === c ? <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" /> : null}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.preview, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={asIcon(icon)} size={26} color={color} />
        <Text style={[styles.previewText, { color: theme.textPrimary }]} numberOfLines={1}>
          {name.trim() || 'Vista previa'}
        </Text>
      </View>

      <RippleButton label={existing ? 'Guardar cambios' : 'Crear materia'} icon="check" loading={saving} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700' },
  row: { gap: 7, paddingRight: 8 },
  note: { fontSize: 11.5, fontStyle: 'italic' },
  dropdown: { paddingVertical: 4, paddingHorizontal: 0, marginTop: -6 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, minHeight: 54 },
  optionText: { flex: 1, paddingVertical: 8 },
  optionName: { fontSize: 14.5, fontWeight: '700' },
  optionMeta: { fontSize: 12, marginTop: 1 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14 },
  previewText: { flex: 1, fontSize: 15, fontWeight: '800' },
});
