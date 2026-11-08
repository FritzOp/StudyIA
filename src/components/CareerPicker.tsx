import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { getAllUndergraduatePrograms } from '@/data/uniguajiraData';

/** Selector de programas académicos del catálogo de la Universidad de La Guajira. */
export function CareerPicker({
  visible,
  value,
  onSelect,
  onClose,
  title = 'Programas Uniguajira',
  allowCustom = false,
  exclude = [],
}: {
  visible: boolean;
  value: string;
  onSelect: (career: string) => void;
  onClose: () => void;
  title?: string;
  /** Permite usar lo escrito en la búsqueda si la carrera no está en el catálogo. */
  allowCustom?: boolean;
  /** Carreras que ya tiene el estudiante: no se vuelven a ofrecer. */
  exclude?: string[];
}) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const programs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const taken = new Set(exclude.map((c) => c.toLowerCase()));
    return getAllUndergraduatePrograms().filter(
      (p) =>
        !taken.has(p.name.toLowerCase()) &&
        (p.name.toLowerCase().includes(q) ||
          p.facultyName.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q))
    );
  }, [search, exclude]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="school" size={24} color={theme.primary} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.search, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.textMuted} />
            <TextInput
              accessibilityLabel="Buscar carrera"
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Buscar carrera o facultad..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {programs.map((p) => {
              const selected = value.toLowerCase() === p.name.toLowerCase();
              return (
                <Pressable
                  key={`${p.facultyId}-${p.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(p.name);
                    setSearch('');
                    onClose();
                  }}
                  style={[
                    styles.item,
                    {
                      backgroundColor: selected ? theme.primaryLight : theme.surfaceElevated,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View style={styles.itemText}>
                    <Text style={[styles.itemName, { color: selected ? theme.primary : theme.textPrimary }]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.itemFaculty, { color: theme.textMuted }]}>
                      {p.facultyName} · {p.code}
                    </Text>
                  </View>
                  {selected ? <MaterialCommunityIcons name="check-circle" size={20} color={theme.primary} /> : null}
                </Pressable>
              );
            })}
            {allowCustom &&
            search.trim().length >= 3 &&
            !programs.some((p) => p.name.toLowerCase() === search.trim().toLowerCase()) ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onSelect(search.trim());
                  setSearch('');
                  onClose();
                }}
                style={[styles.item, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.primary} />
                <View style={styles.itemText}>
                  <Text style={[styles.itemName, { color: theme.textPrimary }]}>Usar «{search.trim()}»</Text>
                  <Text style={[styles.itemFaculty, { color: theme.textMuted }]}>
                    No está en el catálogo de Uniguajira
                  </Text>
                </View>
              </Pressable>
            ) : null}
            {programs.length === 0 && !allowCustom ? (
              <Text style={[styles.none, { color: theme.textMuted }]}>Sin resultados.</Text>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  card: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 14, minHeight: 44 },
  item: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, gap: 8 },
  itemText: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemFaculty: { fontSize: 11.5, marginTop: 2 },
  none: { textAlign: 'center', padding: 20 },
});
