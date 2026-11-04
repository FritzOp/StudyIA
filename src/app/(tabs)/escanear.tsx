import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraScanner } from '@/components/CameraScanner';
import { AnimatedEntrance, AnimatedPressable, RippleButton, SlidingTabs } from '@/components/motion';
import { Banner, Chip, EmptyState, Field, Screen, type IconName } from '@/components/ui';
import { useAuth, useUserId } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import { materialsRepo } from '@/db/repositories/materials';
import type { MaterialSource } from '@/db/schema';
import { useCameraAccess } from '@/hooks/useCamera';
import { useSubjects } from '@/hooks/useStudyData';
import { processMaterial } from '@/services/ai/pipeline';
import { compressImage, MAX_DOCUMENT_BYTES, persistFile, readAsText } from '@/services/files';
import { randomUUID } from 'expo-crypto';

type Mode = 'photo' | 'document' | 'text';

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  kind: MaterialSource;
  extension: string;
};

const EXAMPLE_TEXT = `La inteligencia artificial es un área de la informática que busca desarrollar sistemas capaces de realizar tareas asociadas tradicionalmente con la inteligencia humana.

Machine Learning es una rama de la inteligencia artificial que permite a los sistemas aprender patrones a partir de datos, sin programar cada regla de forma explícita.

Las redes neuronales son modelos inspirados en el cerebro, formados por capas de neuronas artificiales que transforman los datos de entrada. El aprendizaje profundo utiliza redes neuronales con muchas capas para resolver problemas complejos como la visión artificial.

El procesamiento del lenguaje natural es la disciplina que permite a las máquinas comprender y generar lenguaje humano. Los modelos de lenguaje aprenden a partir de grandes cantidades de texto y se usan en traductores y asistentes.`;

const stripExtension = (name: string) => name.replace(/\.[^.]+$/, '');

export default function ScanScreen() {
  const { subjectId: subjectParam } = useLocalSearchParams<{ subjectId?: string }>();
  const userId = useUserId();
  const { isGuest } = useAuth();
  const { theme } = useTheme();
  const { canUseCloud, isOnline } = useSync();
  const subjects = useSubjects();
  const { ensurePermission } = useCameraAccess();

  const [mode, setMode] = useState<Mode>('photo');
  const [picked, setPicked] = useState<{ id: string; forParam?: string } | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al llegar desde el detalle de una materia, esa materia gana hasta que el usuario elija otra.
  const subjectId = picked && picked.forParam === subjectParam ? picked.id : (subjectParam ?? picked?.id);
  const selected = useMemo(
    () => subjects.find((s) => s.id === subjectId) ?? subjects[0],
    [subjects, subjectId]
  );

  const prepareImage = async (uri: string, name: string) => {
    try {
      const compressed = await compressImage(uri);
      setFile({ uri: compressed, name, mimeType: 'image/jpeg', kind: 'image', extension: 'jpg' });
      setError(null);
    } catch {
      setError('No se pudo preparar la imagen. Intenta con otra foto.');
    }
  };

  const openCamera = async () => {
    if (await ensurePermission()) setCameraVisible(true);
  };

  const pickFromGallery = async () => {
    // El selector moderno del sistema no requiere pedir permiso de galería.
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    setCameraVisible(false);
    if (!result.canceled && result.assets[0]) {
      // En Android el nombre puede ser solo un número ("37"): no sirve como título.
      await prepareImage(result.assets[0].uri, 'Foto del apunte');
    }
  };

  const pickDocument = async () => {
    // El selector de expo-file-system concede permiso de lectura sobre el archivo elegido.
    // El de expo-document-picker deja una copia que File no puede leer dentro de Expo Go.
    const picked = await File.pickFileAsync({
      mimeTypes: ['application/pdf', 'text/plain', 'text/markdown'],
    });
    if (picked.canceled) return;
    const asset = picked.result;
    if (asset.size > MAX_DOCUMENT_BYTES) {
      setError('El archivo supera los 6 MB. Sube un PDF más corto o divídelo por capítulos.');
      return;
    }
    const isPdf = asset.type === 'application/pdf' || asset.name.toLowerCase().endsWith('.pdf');
    // Android a veces solo entrega un identificador ("document:36"): no sirve como nombre.
    const hasRealName = /\.[a-z0-9]+$/i.test(asset.name);
    if (isPdf) {
      setFile({
        uri: asset.uri,
        name: hasRealName ? asset.name : 'Documento PDF',
        mimeType: 'application/pdf',
        kind: 'pdf',
        extension: 'pdf',
      });
      setError(null);
      if (!title.trim() && hasRealName) setTitle(stripExtension(asset.name));
      return;
    }
    try {
      // Un archivo de texto se procesa igual que el texto escrito: funciona sin conexión.
      setText(await readAsText(asset.uri));
      setFile(null);
      setMode('text');
      setError(null);
      if (!title.trim() && hasRealName) setTitle(stripExtension(asset.name));
    } catch {
      setError('No se pudo leer el archivo. Verifica que sea PDF o texto plano.');
    }
  };

  const reset = () => {
    setTitle('');
    setText('');
    setFile(null);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!selected) return setError('Primero crea una materia para organizar el apunte.');
    const trimmedText = text.trim();
    if (mode === 'text' && !trimmedText) return setError('Escribe o pega el texto de tu apunte.');
    if (mode !== 'text' && !file) return setError('Primero elige una foto o un documento.');

    setSaving(true);
    try {
      const fallbackTitle =
        mode === 'text'
          ? trimmedText.split(/\s+/).slice(0, 6).join(' ')
          : stripExtension(file?.name ?? 'Apunte');
      const fileUri =
        mode !== 'text' && file ? await persistFile(file.uri, randomUUID(), file.extension) : null;

      const id = await materialsRepo.create(userId, {
        subjectId: selected.id,
        title: title.trim() || fallbackTitle,
        sourceType: mode === 'text' ? 'text' : (file?.kind ?? 'image'),
        sourceText: mode === 'text' ? trimmedText : null,
        fileUri,
        fileName: mode === 'text' ? null : (file?.name ?? null),
        mimeType: mode === 'text' ? null : (file?.mimeType ?? null),
      });

      // Sin await: la pantalla del apunte muestra el avance leyendo el estado desde SQLite.
      processMaterial(id, { canUseCloud, subjectName: selected.name }).catch(() => undefined);

      reset();
      router.push({ pathname: '/material/[id]', params: { id } });
    } catch (e) {
      console.warn('No se pudo guardar el apunte:', e);
      Alert.alert('No se pudo guardar', 'Ocurrió un problema al guardar el apunte. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const banner = canUseCloud
    ? null
    : isGuest
      ? {
          title: 'Modo sin cuenta',
          message: 'El texto se analiza sin IA en tu teléfono. Para leer fotos y PDF con IA, crea una cuenta.',
        }
      : {
          title: isOnline ? 'Conectando con tu cuenta…' : 'Sin conexión',
          message: 'Guarda tu apunte igual: las fotos y los PDF se procesarán con IA cuando vuelva la conexión.',
        };

  if (subjects.length === 0) {
    return (
      <Screen title="Escanear apunte" subtitle="Convierte tus apuntes en material de estudio">
        <EmptyState
          icon="book-plus-outline"
          title="Primero crea una materia"
          message="Cada apunte se guarda dentro de una materia para que puedas seguir tu progreso."
          actionLabel="Crear materia"
          onAction={() => router.push('/materia/editar')}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Escanear apunte" subtitle="Convierte tus apuntes en resumen, flashcards y quiz">
      {banner ? <Banner tone="warning" icon="cloud-off-outline" title={banner.title} message={banner.message} /> : null}

      <SlidingTabs<Mode>
        tabs={[
          { id: 'photo', label: 'Foto', icon: 'camera-outline' },
          { id: 'document', label: 'Documento', icon: 'file-document-outline' },
          { id: 'text', label: 'Texto', icon: 'text-long' },
        ]}
        value={mode}
        onChange={(next) => {
          setMode(next);
          setFile(null);
          setError(null);
        }}
      />

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Materia</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {subjects.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              color={s.color}
              selected={selected?.id === s.id}
              onPress={() => setPicked({ id: s.id, forParam: subjectParam })}
            />
          ))}
        </ScrollView>
      </View>

      <Field
        label="Título (opcional)"
        icon="format-title"
        placeholder="Ej. Unidad 2: Redes neuronales"
        value={title}
        onChangeText={setTitle}
      />

      {mode === 'photo' ? (
        <AnimatedEntrance key="photo" duration={260}>
          <View style={styles.options}>
            <SourceOption
              icon="camera"
              title="Cámara"
              description="Toma una foto nueva"
              color={theme.primary}
              onPress={openCamera}
            />
            <SourceOption
              icon="image-multiple-outline"
              title="Galería"
              description="Elige una foto guardada"
              color={theme.secondary}
              onPress={pickFromGallery}
            />
          </View>
        </AnimatedEntrance>
      ) : null}

      {mode === 'document' ? (
        <AnimatedEntrance key="document" duration={260}>
          <SourceOption
            icon="file-upload-outline"
            title="Elegir archivo"
            description="PDF de hasta 6 MB, o archivo de texto (.txt, .md)"
            color={theme.accentPurple}
            onPress={pickDocument}
          />
        </AnimatedEntrance>
      ) : null}

      {mode === 'text' ? (
        <AnimatedEntrance key="text" duration={260} style={styles.block}>
          <Field
            label="Tu apunte"
            placeholder="Escribe o pega aquí el contenido..."
            value={text}
            onChangeText={setText}
            multiline
            inputStyle={styles.textArea}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setText(EXAMPLE_TEXT);
              if (!title.trim()) setTitle('Introducción a la inteligencia artificial');
            }}
            style={styles.example}
          >
            <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={theme.primary} />
            <Text style={[styles.exampleText, { color: theme.primary }]}>Usar un texto de ejemplo</Text>
          </Pressable>
        </AnimatedEntrance>
      ) : null}

      {file ? (
        <AnimatedEntrance type="scale" duration={260}>
          <View style={[styles.picked, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {file.kind === 'image' ? (
              <Image source={{ uri: file.uri }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.pdfIcon, { backgroundColor: theme.errorLight }]}>
                <MaterialCommunityIcons name="file-pdf-box" size={30} color={theme.error} />
              </View>
            )}
            <Text style={[styles.pickedName, { color: theme.textPrimary }]} numberOfLines={2}>
              {file.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quitar archivo"
              hitSlop={10}
              onPress={() => setFile(null)}
            >
              <MaterialCommunityIcons name="close-circle" size={22} color={theme.textMuted} />
            </Pressable>
          </View>
        </AnimatedEntrance>
      ) : null}

      {error ? <Banner tone="error" icon="alert-circle-outline" title={error} /> : null}

      <RippleButton label="Generar material de estudio" icon="creation" loading={saving} onPress={submit} />

      <Text style={[styles.notice, { color: theme.textMuted }]}>
        El contenido se procesa con la API de Gemini de Google en su plan gratuito, en el que Google puede usarlo
        para mejorar sus productos. No subas datos personales ni información sensible.
      </Text>

      <CameraScanner
        visible={cameraVisible}
        subjectName={selected?.name ?? ''}
        onClose={() => setCameraVisible(false)}
        onPickGallery={pickFromGallery}
        onConfirm={(uri) => {
          setCameraVisible(false);
          prepareImage(uri, 'Foto del apunte');
        }}
      />
    </Screen>
  );
}

function SourceOption({
  icon,
  title,
  description,
  color,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.option}>
      <AnimatedPressable
        accessibilityLabel={title}
        onPress={onPress}
        style={[styles.optionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
      >
        <View style={[styles.optionIcon, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={icon} size={30} color={color} />
        </View>
        <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.optionDescription, { color: theme.textMuted }]}>{description}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700' },
  chips: { gap: 7, paddingRight: 8 },
  options: { flexDirection: 'row', gap: 12 },
  option: { flex: 1 },
  optionCard: { borderWidth: 1, borderRadius: 18, padding: 16, alignItems: 'center', gap: 5 },
  optionIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  optionTitle: { fontSize: 14, fontWeight: '800' },
  optionDescription: { fontSize: 12, textAlign: 'center', lineHeight: 16 },
  textArea: { minHeight: 170, maxHeight: 240, textAlignVertical: 'top' },
  example: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, alignSelf: 'flex-start' },
  exampleText: { fontSize: 13, fontWeight: '700' },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 10 },
  thumbnail: { width: 54, height: 54, borderRadius: 10 },
  pdfIcon: { alignItems: 'center', justifyContent: 'center' },
  pickedName: { flex: 1, fontSize: 13, fontWeight: '600' },
  notice: { fontSize: 11.5, lineHeight: 16, textAlign: 'center' },
});
