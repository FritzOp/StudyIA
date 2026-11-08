import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RippleButton } from '@/components/motion';
import { asIcon, Chip, Field, Screen } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { uniguajiraCurriculumSubjects } from '@/data/uniguajiraData';
import { subjectsRepo } from '@/db/repositories/subjects';
import { useProfile, useSubject, useSubjects } from '@/hooks/useStudyData';
import { activeCareers, semesterNumber, suggestSubjects } from '@/lib/careers';
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
  const query = name.trim().toLowerCase();

  // Sin texto se sugieren las asignaturas de la carrera; al escribir se busca en todo el catálogo.
  const suggestions = useMemo(() => {
    if (query) return uniguajiraCurriculumSubjects.filter((s) => s.name.toLowerCase().includes(query)).slice(0, 20);
    return suggestSubjects(
      careers,
      subjects.map((s) => s.name),
      12,
      semester
    );
  }, [query, careers, subjects, semester]);

  const suggestionsLabel =
    query || careers.length === 0
      ? 'Catálogo Uniguajira (toca para autocompletar)'
      : `Sugeridas para ${careers.join(' y ')}${profile?.semester ? ` · ${profile.semester.toLowerCase()}` : ''}`;

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
        placeholder="Ej. Bases de Datos"
        value={name}
        error={nameError}
        onChangeText={(text) => {
          setName(text);
          setNameError(null);
        }}
      />

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{suggestionsLabel}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.row}
        >
          {suggestions.map((s) => (
            <Chip
              key={s.code}
              label={s.name}
              selected={name === s.name}
              onPress={() => {
                setName(s.name);
                setCode(s.code);
                setDescription(s.desc);
                setIcon(s.icon);
                setNameError(null);
              }}
            />
          ))}
        </ScrollView>
      </View>

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
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14 },
  previewText: { flex: 1, fontSize: 15, fontWeight: '800' },
});
