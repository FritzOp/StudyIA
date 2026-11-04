import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SubjectCard } from '@/components/Cards';
import { AnimatedEntrance, RippleButton } from '@/components/motion';
import { EmptyState, Field, Screen } from '@/components/ui';
import { useStudyOverview } from '@/hooks/useStudyData';
import { confirmDeleteSubject } from '@/lib/confirmations';

export default function SubjectsScreen() {
  const { bySubject } = useStudyOverview();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bySubject;
    return bySubject.filter(
      ({ subject }) => subject.name.toLowerCase().includes(q) || subject.code.toLowerCase().includes(q)
    );
  }, [bySubject, search]);

  return (
    <Screen title="Mis materias" subtitle="Toca para ver sus apuntes; mantén presionado para eliminar">
      {bySubject.length > 0 ? (
        <Field
          label="Buscar"
          icon="magnify"
          placeholder="Nombre o código de la materia"
          value={search}
          onChangeText={setSearch}
        />
      ) : null}

      <View style={styles.list}>
        {filtered.map((item, index) => (
          <AnimatedEntrance key={item.subject.id} delay={Math.min(index, 8) * 50}>
            <SubjectCard
              stats={item}
              onPress={() => router.push({ pathname: '/materia/[id]', params: { id: item.subject.id } })}
              onLongPress={() => confirmDeleteSubject(item.subject)}
            />
          </AnimatedEntrance>
        ))}
      </View>

      {bySubject.length === 0 ? (
        <EmptyState
          icon="book-plus-outline"
          title="Aún no tienes materias"
          message="Agrega tus asignaturas. Puedes elegirlas del catálogo de la Universidad de La Guajira."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="magnify" title="Sin resultados" message={`Ninguna materia coincide con "${search}".`} />
      ) : null}

      <RippleButton label="Nueva materia" icon="plus" onPress={() => router.push('/materia/editar')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
