import { Alert } from 'react-native';
import { materialsRepo } from '@/db/repositories/materials';
import { subjectsRepo } from '@/db/repositories/subjects';
import type { Material, Subject } from '@/db/schema';
import { deleteLocalFile } from '@/services/files';

export function confirmDeleteSubject(subject: Subject, onDeleted?: () => void) {
  Alert.alert(
    `¿Eliminar "${subject.name}"?`,
    'También se eliminarán sus apuntes, flashcards y resultados, en este teléfono y en la nube.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          subjectsRepo.remove(subject.id).then(onDeleted);
        },
      },
    ]
  );
}

export function confirmDeleteMaterial(material: Material, onDeleted?: () => void) {
  Alert.alert(`¿Eliminar "${material.title}"?`, 'Se eliminan su resumen, flashcards y resultados.', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Eliminar',
      style: 'destructive',
      onPress: () => {
        materialsRepo.remove(material.id).then(() => {
          deleteLocalFile(material.fileUri);
          onDeleted?.();
        });
      },
    },
  ]);
}
