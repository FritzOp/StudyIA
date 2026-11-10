import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShimmeringText } from '@/components/motion';
import { Banner, Chip, Screen } from '@/components/ui';
import { useUserId } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTheme } from '@/context/ThemeContext';
import { tutorRepo } from '@/db/repositories/tutor';
import type { Material, TutorAttachment, TutorMessage } from '@/db/schema';
import { useMaterial, useProfile, useTutorMessages } from '@/hooks/useStudyData';
import { activeCareers } from '@/lib/careers';
import { filesToSend, fitToBudget, historyToSend, questionText } from '@/lib/tutorChat';
import { explainWithAi } from '@/services/ai/remoteGenerator';
import { compressImage, fileExists, MAX_DOCUMENT_BYTES, persistAttachment, readAsBase64 } from '@/services/files';

/** Chat con StudyIA sobre un apunte: ve la foto original, admite adjuntos y recuerda lo hablado. */
export default function TutorChatScreen() {
  const { materialId } = useLocalSearchParams<{ materialId: string }>();
  const material = useMaterial(materialId);
  if (!material) return <Screen title="Pregúntale a StudyIA" back>{null}</Screen>;
  return <Chat material={material} />;
}

type Draft = TutorAttachment;

function Chat({ material }: { material: Material }) {
  const { theme } = useTheme();
  const userId = useUserId();
  const { canUseCloud } = useSync();
  const profile = useProfile();
  const insets = useSafeAreaInsets();
  const messages = useTutorMessages(material.id);
  const listRef = useRef<FlatList<TutorMessage>>(null);
  const [input, setInput] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOriginal = !!material.fileUri && fileExists(material.fileUri);
  const starters = useMemo(
    () =>
      hasOriginal
        ? ['¿Qué dice mi foto?', 'Resuelve la primera operación paso a paso', 'Explícamelo con un ejemplo']
        : ['Explícame el tema con un ejemplo', 'Resume en 3 ideas', 'Hazme una pregunta para practicar'],
    [hasOriginal]
  );

  /** Llama a la IA con la última pregunta del estudiante y guarda la respuesta. */
  const answer = useCallback(
    async (all: TutorMessage[]) => {
      const last = all[all.length - 1];
      if (!last || last.role !== 'user') return;
      setLoading(true);
      setError(null);
      try {
        const candidates = filesToSend(material, all).filter((f) => fileExists(f.uri));
        const withData = await Promise.all(
          candidates.map(async (f) => ({ base64: await readAsBase64(f.uri), mediaType: f.mimeType, label: f.label }))
        );
        const reply = await explainWithAi({
          question: last.text,
          title: material.title,
          context: [material.summary, material.keyConcepts?.join(', '), material.sourceText].filter(Boolean).join('\n\n'),
          careers: activeCareers(profile),
          semester: profile?.semester,
          history: historyToSend(all.slice(0, -1)),
          files: fitToBudget(withData),
        });
        await tutorRepo.add(userId, material.id, 'assistant', reply);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'StudyIA no pudo responder.');
      } finally {
        setLoading(false);
      }
    },
    [material, profile, userId]
  );

  const send = async (preset?: string) => {
    const text = questionText(preset ?? input, preset ? [] : drafts);
    if (!text || loading) return;
    const attachments = preset ? [] : await Promise.all(drafts.map(saveDraft));
    setInput('');
    setDrafts([]);
    const message = await tutorRepo.add(userId, material.id, 'user', text, attachments);
    await answer([...messages, message]);
  };

  const attach = () => {
    Alert.alert('Adjuntar', 'StudyIA podrá ver lo que adjuntes en esta conversación.', [
      { text: 'Tomar foto', onPress: () => pickImage('camera') },
      { text: 'Foto de la galería', onPress: () => pickImage('library') },
      { text: 'PDF', onPress: pickPdf },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Para tomar una foto, permite el acceso a la cámara en los ajustes.');
          return;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;
      const uri = await compressImage(asset.uri);
      setDrafts((d) => [...d, { uri, mimeType: 'image/jpeg', name: `Foto ${d.length + 1}` }]);
      setError(null);
    } catch {
      setError('No se pudo preparar la imagen. Intenta con otra.');
    }
  };

  const pickPdf = async () => {
    const picked = await File.pickFileAsync({ mimeTypes: ['application/pdf'] });
    if (picked.canceled) return;
    const asset = picked.result;
    if (asset.size > MAX_DOCUMENT_BYTES) {
      setError('El PDF supera los 6 MB.');
      return;
    }
    const name = /\.pdf$/i.test(asset.name) ? asset.name : 'Documento PDF';
    setDrafts((d) => [...d, { uri: asset.uri, mimeType: 'application/pdf', name }]);
    setError(null);
  };

  const clear = () =>
    Alert.alert('¿Borrar la conversación?', 'Se borran los mensajes y los archivos adjuntos de este chat.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => tutorRepo.clear(userId, material.id) },
    ]);

  const canSend = canUseCloud && !loading && (input.trim().length > 0 || drafts.length > 0);

  return (
    <Screen
      title="Pregúntale a StudyIA"
      subtitle={material.title}
      back
      scroll={false}
      right={
        messages.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Borrar conversación" hitSlop={10} onPress={clear}>
            <MaterialCommunityIcons name="delete-sweep-outline" size={24} color={theme.textMuted} />
          </Pressable>
        ) : undefined
      }
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Bubble role="assistant">
              <Text style={[styles.text, { color: theme.textPrimary }]}>
                {hasOriginal
                  ? `Hola. Ya veo tu ${material.mimeType === 'application/pdf' ? 'PDF' : 'foto'} de «${material.title}», incluidas sus operaciones. Pregúntame lo que no entiendas o adjunta más archivos.`
                  : `Hola. Pregúntame lo que no entiendas de «${material.title}». También puedes adjuntar fotos o PDF.`}
              </Text>
            </Bubble>
            {messages.length === 0 && canUseCloud ? (
              <View style={styles.starters}>
                {starters.map((s) => (
                  <Chip key={s} label={s} selected={false} onPress={() => send(s)} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Bubble role={item.role}>
            {item.attachments.length > 0 ? <Attachments items={item.attachments} onUser={item.role === 'user'} /> : null}
            {item.text ? (
              <Text
                selectable
                style={[styles.text, { color: item.role === 'user' ? theme.onPrimary : theme.textPrimary }]}
              >
                {item.text}
              </Text>
            ) : null}
          </Bubble>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {loading ? (
              <Bubble role="assistant">
                <ShimmeringText text="StudyIA está pensando…" style={[styles.thinking, { color: theme.primary }]} />
              </Bubble>
            ) : null}
            {error ? (
              <Banner
                tone="error"
                icon="alert-circle-outline"
                title={error}
                action={
                  messages[messages.length - 1]?.role === 'user' ? (
                    <Pressable accessibilityRole="button" hitSlop={8} onPress={() => answer(messages)}>
                      <Text style={[styles.retry, { color: theme.primary }]}>Reintentar</Text>
                    </Pressable>
                  ) : undefined
                }
              />
            ) : null}
          </View>
        }
      />

      <View
        style={[
          styles.composer,
          { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        {!canUseCloud ? (
          <Text style={[styles.offline, { color: theme.textMuted }]}>
            El chat con StudyIA funciona en la nube: necesita conexión y una cuenta iniciada.
          </Text>
        ) : null}
        {drafts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drafts}>
            {drafts.map((d, i) => (
              <View key={d.uri} style={[styles.draft, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                {d.mimeType.startsWith('image/') ? (
                  <Image source={{ uri: d.uri }} style={styles.draftImage} />
                ) : (
                  <MaterialCommunityIcons name="file-pdf-box" size={30} color={theme.primary} />
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${d.name}`}
                  hitSlop={8}
                  onPress={() => setDrafts((all) => all.filter((_, j) => j !== i))}
                  style={[styles.removeDraft, { backgroundColor: theme.textPrimary }]}
                >
                  <MaterialCommunityIcons name="close" size={12} color={theme.background} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.inputRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adjuntar foto o PDF"
            disabled={!canUseCloud || loading}
            onPress={attach}
            style={[styles.roundButton, { backgroundColor: theme.surfaceElevated, opacity: canUseCloud ? 1 : 0.5 }]}
          >
            <MaterialCommunityIcons name="paperclip" size={22} color={theme.textSecondary} />
          </Pressable>
          <TextInput
            accessibilityLabel="Escribe tu pregunta"
            style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
            placeholder={canUseCloud ? 'Escribe tu pregunta…' : 'Sin conexión con StudyIA'}
            placeholderTextColor={theme.textMuted}
            value={input}
            onChangeText={setInput}
            editable={canUseCloud}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar"
            disabled={!canSend}
            onPress={() => send()}
            style={[styles.roundButton, { backgroundColor: canSend ? theme.primary : theme.surfaceElevated }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.textMuted} />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color={canSend ? theme.onPrimary : theme.textMuted} />
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

/** Copia el adjunto al almacenamiento de la app para que siga disponible en otras preguntas. */
async function saveDraft(draft: Draft): Promise<TutorAttachment> {
  const extension = draft.mimeType === 'application/pdf' ? 'pdf' : 'jpg';
  const uri = await persistAttachment(draft.uri, Crypto.randomUUID(), extension);
  return { ...draft, uri };
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const { theme } = useTheme();
  const mine = role === 'user';
  return (
    <View style={[styles.row, mine ? styles.rowMine : null]}>
      {!mine ? (
        <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
          <MaterialCommunityIcons name="creation" size={16} color={theme.primary} />
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: theme.primary, borderBottomRightRadius: 6 }
            : { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 6 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Attachments({ items, onUser }: { items: TutorAttachment[]; onUser: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.attachments}>
      {items.map((a) =>
        a.mimeType.startsWith('image/') && fileExists(a.uri) ? (
          <Image key={a.uri} source={{ uri: a.uri }} style={styles.attachmentImage} resizeMode="cover" />
        ) : (
          <View key={a.uri} style={styles.pdf}>
            <MaterialCommunityIcons name="file-pdf-box" size={20} color={onUser ? theme.onPrimary : theme.primary} />
            <Text style={[styles.pdfName, { color: onUser ? theme.onPrimary : theme.textPrimary }]} numberOfLines={1}>
              {a.name}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  intro: { gap: 12 },
  starters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 40 },
  footer: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '100%' },
  rowMine: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  text: { fontSize: 15, lineHeight: 22 },
  thinking: { fontSize: 14, fontWeight: '700' },
  retry: { fontSize: 13, fontWeight: '800', padding: 4 },
  attachments: { gap: 6 },
  attachmentImage: { width: 200, height: 150, borderRadius: 12 },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pdfName: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 10, gap: 8 },
  offline: { fontSize: 12.5, textAlign: 'center' },
  drafts: { gap: 8 },
  draft: { width: 64, height: 64, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  draftImage: { width: 62, height: 62, borderRadius: 11 },
  removeDraft: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  roundButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 130, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, fontSize: 15 },
});
