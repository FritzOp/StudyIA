import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import FileText from 'reicon-react-native/icons/FileText';
import Layers from 'reicon-react-native/icons/Layers';
import { shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCamera } from '../hooks/useCamera';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from '../components/AnimatedContainer';

const { width } = Dimensions.get('window');

export default function UploadScreen() {
  const { subjects, setCurrentScreen } = useAuth();
  const { theme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Inteligencia Artificial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [flashMode, setFlashMode] = useState('off'); // 'off' | 'on' | 'auto'
  const [previewCapturedPhoto, setPreviewCapturedPhoto] = useState(null);

  // Animación de escaneo láser para el marco de la cámara
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cameraModalVisible && !previewCapturedPhoto) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [cameraModalVisible, previewCapturedPhoto, scanAnim]);

  // Hook personalizado de cámara y permisos
  const {
    cameraRef,
    permissionState,
    ensureCameraPermission,
    openSettings,
    facing,
    toggleFacing,
    onCameraReady,
    takePhoto,
    pickImageFromGallery,
    clearPhoto,
    isCapturing,
  } = useCamera();

  const handleStartCamera = async () => {
    const hasPermission = await ensureCameraPermission();
    if (hasPermission) {
      setPreviewCapturedPhoto(null);
      setCameraModalVisible(true);
    } else {
      Alert.alert(
        'Permiso Denegado',
        'No se puede acceder a la cámara sin tu autorización. Puedes habilitarla desde la configuración de tu teléfono.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configuración', onPress: openSettings },
        ]
      );
    }
  };

  const handleCapturePhoto = async () => {
    const photo = await takePhoto();
    if (photo?.uri) {
      setPreviewCapturedPhoto(photo.uri);
    }
  };

  const handleConfirmAndProcess = () => {
    if (previewCapturedPhoto) {
      const uri = previewCapturedPhoto;
      setCameraModalVisible(false);
      setPreviewCapturedPhoto(null);
      handleProcessImage(uri, 'Cámara StudyIA');
    }
  };

  const handlePickGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      handleProcessImage(uri, 'Galería');
    }
  };

  const handleProcessImage = (uri, source) => {
    setIsProcessing(true);
    setGeneratedResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setGeneratedResult({
        source,
        imageUri: uri,
        subject: selectedSubject,
        title: `Apunte Procesado: ${selectedSubject}`,
        summary:
          'Se procesó con éxito la captura del apunte. El motor de Inteligencia Artificial extrajo la información clave, identificó definiciones fundamentales y estructuró preguntas para memorización activa.',
        flashcards: [
          {
            q: '¿Cuál es el concepto clave detectado?',
            a: 'La estructura conceptual del tema y su aplicación práctica en proyectos reales.',
          },
          {
            q: '¿Cómo repasar este contenido?',
            a: 'Utilizando el mazo de flashcards y los cuestionarios automáticos generados.',
          },
        ],
      });
    }, 2200);
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'));
  };

  const translateYScan = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <AnimatedEntrance type="slideDown" duration={400}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Escanear con IA</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Toma fotos de tus apuntes con la cámara StudyIA para sintetizarlos y generar resúmenes automáticos.
          </Text>
        </View>
      </AnimatedEntrance>

      {/* Tarjeta de Estado de Permisos de Cámara */}
      <AnimatedEntrance type="slideUp" duration={450} delay={100}>
        <View
          style={[
            styles.permissionBanner,
            { backgroundColor: permissionState === 'granted' ? theme.successLight : theme.warningLight },
            { borderColor: permissionState === 'granted' ? theme.success : theme.warning },
          ]}
        >
          <MaterialCommunityIcons
            name={permissionState === 'granted' ? 'camera' : 'camera-off'}
            size={22}
            color={permissionState === 'granted' ? theme.success : theme.warning}
          />
          <View style={styles.permissionTextContainer}>
            <Text style={[styles.permissionTitle, { color: theme.textPrimary }]}>
              {permissionState === 'granted'
                ? 'Permiso de Cámara Activo'
                : 'Permiso de Cámara Requerido'}
            </Text>
            <Text style={[styles.permissionDesc, { color: theme.textSecondary }]}>
              {permissionState === 'granted'
                ? 'Listo para escanear apuntes en tiempo real.'
                : 'Se necesita autorización para fotografiar cuadernos y libros.'}
            </Text>
          </View>
          {permissionState !== 'granted' && (
            <TouchableOpacity
              style={[styles.permissionBtn, { backgroundColor: theme.primary }]}
              onPress={handleStartCamera}
            >
              <Text style={styles.permissionBtnText}>Habilitar</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedEntrance>

      {/* Selector de Materia */}
      <AnimatedEntrance type="slideUp" duration={450} delay={150}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Asignar a Materia:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectsRow}>
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub.name;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectChip,
                  { backgroundColor: isSelected ? theme.primary : theme.cardBg, borderColor: isSelected ? theme.primary : theme.border },
                ]}
                onPress={() => setSelectedSubject(sub.name)}
              >
                <Text style={[styles.subjectChipText, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </AnimatedEntrance>

      {/* Opciones de Carga */}
      <AnimatedEntrance type="slideUp" duration={450} delay={200}>
        <View style={styles.uploadOptions}>
          <AnimatedPressable
            style={[styles.optionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={handleStartCamera}
            disabled={isProcessing}
          >
            <View style={[styles.optionIconBox, { backgroundColor: `${theme.primary}18` }]}>
              <MaterialCommunityIcons name="camera" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Cámara StudyIA</Text>
            <Text style={[styles.optionDesc, { color: theme.textMuted }]}>Escáner inteligente con guías OCR</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.optionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={handlePickGallery}
            disabled={isProcessing}
          >
            <View style={[styles.optionIconBox, { backgroundColor: `${theme.secondary}18` }]}>
              <MaterialCommunityIcons name="image-multiple-outline" size={32} color={theme.secondary} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Galería</Text>
            <Text style={[styles.optionDesc, { color: theme.textMuted }]}>Elige fotos de tu almacenamiento</Text>
          </AnimatedPressable>
        </View>
      </AnimatedEntrance>

      {/* Procesando con IA */}
      {isProcessing && (
        <AnimatedEntrance type="scale" duration={300} style={[styles.loadingBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <AnimatedPulse>
            <View style={[styles.sparkleIconBox, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name="brain" size={40} color={theme.primary} />
            </View>
          </AnimatedPulse>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 10 }} />
          <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>Procesando Apunte con IA...</Text>
          <Text style={[styles.loadingSubtitle, { color: theme.textMuted }]}>
            Extrayendo texto de la captura y estructurando tarjetas de estudio
          </Text>
        </AnimatedEntrance>
      )}

      {/* Resultado Sintetizado */}
      {generatedResult && !isProcessing && (
        <AnimatedEntrance type="slideUp" duration={500} style={[styles.resultCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultBadge, { backgroundColor: theme.successLight }]}>
              <MaterialCommunityIcons name="check-decagram" size={16} color={theme.success} />
              <Text style={[styles.resultBadgeText, { color: theme.success }]}>¡Síntesis Completada!</Text>
            </View>
            <Text style={[styles.sourceText, { color: theme.textMuted }]}>{generatedResult.subject}</Text>
          </View>

          {generatedResult.imageUri && (
            <Image source={{ uri: generatedResult.imageUri }} style={styles.previewThumbnail} />
          )}

          <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>{generatedResult.title}</Text>

          <View style={styles.blockTitleRow}>
            <FileText size={18} color={theme.primary} weight="Filled" />
            <Text style={[styles.blockTitle, { color: theme.primary }]}>Resumen Extraído:</Text>
          </View>
          <Text style={[styles.summaryText, { backgroundColor: theme.surfaceElevated, color: theme.textSecondary }]}>
            {generatedResult.summary}
          </Text>

          <View style={[styles.blockTitleRow, { marginTop: 14 }]}>
            <Layers size={18} color={theme.primary} weight="Filled" />
            <Text style={[styles.blockTitle, { color: theme.primary }]}>Flashcards Creadas:</Text>
          </View>
          {generatedResult.flashcards.map((f, i) => (
            <View key={i} style={[styles.flashcardItem, { backgroundColor: theme.surfaceElevated, borderLeftColor: theme.primary }]}>
              <Text style={[styles.flashcardQ, { color: theme.textPrimary }]}>Pregunta: {f.q}</Text>
              <Text style={[styles.flashcardA, { color: theme.textSecondary }]}>Respuesta: {f.a}</Text>
            </View>
          ))}

          <AnimatedPressable
            style={[styles.doneBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Alert.alert('Guardado', 'Los apuntes procesados se agregaron a tu biblioteca.');
              clearPhoto();
              setCurrentScreen('Home');
            }}
          >
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Guardar en Mis Apuntes</Text>
          </AnimatedPressable>
        </AnimatedEntrance>
      )}

      {/* Modal de Cámara StudyIA con Interfaz Temática */}
      <Modal
        visible={cameraModalVisible}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          setCameraModalVisible(false);
          setPreviewCapturedPhoto(null);
        }}
      >
        <View style={styles.cameraRoot}>
          {!previewCapturedPhoto ? (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.cameraView}
                facing={facing}
                flash={flashMode}
                onCameraReady={onCameraReady}
              />

              <View style={styles.cameraUiOverlay}>
                {/* Barra superior con controles temáticos */}
                <View style={styles.topControlBar}>
                  <TouchableOpacity
                    style={styles.circleControlBtn}
                    onPress={() => setCameraModalVisible(false)}
                  >
                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Badge de Materia activa */}
                  <View style={styles.subjectBadge}>
                    <MaterialCommunityIcons name="book-open-outline" size={14} color="#A5B4FC" />
                    <Text style={styles.subjectBadgeText} numberOfLines={1}>
                      {selectedSubject}
                    </Text>
                  </View>

                  <View style={styles.topRightControls}>
                    {/* Botón Flash */}
                    <TouchableOpacity style={styles.circleControlBtn} onPress={toggleFlash}>
                      <MaterialCommunityIcons
                        name={
                          flashMode === 'on'
                            ? 'flash'
                            : flashMode === 'auto'
                            ? 'flash-auto'
                            : 'flash-off'
                        }
                        size={22}
                        color={flashMode !== 'off' ? '#FBBF24' : '#FFFFFF'}
                      />
                    </TouchableOpacity>

                    {/* Botón Voltear Cámara */}
                    <TouchableOpacity style={styles.circleControlBtn} onPress={toggleFacing}>
                      <MaterialCommunityIcons name="camera-flip-outline" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Retículo de Enfoque con Escáner Láser IA */}
                <View style={styles.viewfinderContainer}>
                  <View style={styles.viewfinderReticle}>
                    {/* Esquinas guía temáticas */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    {/* Línea láser de escaneo animada */}
                    <Animated.View
                      style={[
                        styles.laserLine,
                        { transform: [{ translateY: translateYScan }] },
                      ]}
                    />

                    <View style={styles.reticleBadge}>
                      <MaterialCommunityIcons name="creation" size={14} color="#FBBF24" />
                      <Text style={styles.reticleBadgeText}>StudyIA Scanner Activo</Text>
                    </View>
                  </View>

                  <Text style={styles.helperTip}>
                    Alinea los apuntes dentro del marco para un escaneo nítido
                  </Text>
                </View>

                {/* Barra Inferior con Botón de Disparo Shutter Temático */}
                <View style={styles.bottomControlBar}>
                  <TouchableOpacity style={styles.sideActionBtn} onPress={handlePickGallery}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={26} color="#FFFFFF" />
                    <Text style={styles.sideActionLabel}>Galería</Text>
                  </TouchableOpacity>

                  {/* Botón Shutter Principal StudyIA */}
                  <TouchableOpacity
                    style={[styles.shutterButtonOuter, isCapturing && styles.shutterButtonDisabled]}
                    onPress={handleCapturePhoto}
                    disabled={isCapturing}
                    activeOpacity={0.8}
                  >
                    <View style={styles.shutterButtonMiddle}>
                      <View style={styles.shutterButtonInner}>
                        <MaterialCommunityIcons name="camera" size={26} color="#6366F1" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.sideActionBtn}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={26} color="#A5B4FC" />
                    <Text style={styles.sideActionLabel}>Buen brillo</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            /* Vista Previa de la Foto Capturada */
            <View style={styles.previewContainer}>
              <View style={styles.previewTopBar}>
                <Text style={styles.previewTitle}>Captura Realizada</Text>
                <TouchableOpacity onPress={() => setPreviewCapturedPhoto(null)}>
                  <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Image source={{ uri: previewCapturedPhoto }} style={styles.previewImage} resizeMode="contain" />

              <View style={styles.previewActionsBar}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setPreviewCapturedPhoto(null)}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.retakeBtnText}>Repetir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmProcessBtn}
                  onPress={handleConfirmAndProcess}
                >
                  <MaterialCommunityIcons name="creation" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmProcessBtnText}>Sintetizar con IA</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    gap: 10,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  permissionDesc: {
    fontSize: 11,
  },
  permissionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  subjectsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.sm,
  },
  optionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  loadingBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.md,
  },
  sparkleIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  resultCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    ...shadows.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sourceText: {
    fontSize: 11,
  },
  previewThumbnail: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
    borderRadius: 10,
  },
  flashcardItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  flashcardQ: {
    fontSize: 12,
    fontWeight: '700',
  },
  flashcardA: {
    fontSize: 12,
    marginTop: 2,
  },
  doneBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  // Cámara Temática StudyIA
  cameraRoot: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    position: 'relative',
  },
  cameraView: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraUiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.35)',
    justifyContent: 'space-between',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    maxWidth: width * 0.45,
  },
  subjectBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderReticle: {
    width: width * 0.84,
    height: 280,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 14,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#6366F1',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#6366F1',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  reticleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  reticleBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  helperTip: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bottomControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  sideActionBtn: {
    alignItems: 'center',
    minWidth: 60,
  },
  sideActionLabel: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  shutterButtonOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  shutterButtonMiddle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  // Vista previa de foto capturada
  previewContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
  },
  previewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  previewImage: {
    flex: 1,
    borderRadius: 16,
    marginVertical: 18,
    backgroundColor: '#1E293B',
  },
  previewActionsBar: {
    flexDirection: 'row',
    gap: 14,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 14,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmProcessBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 14,
  },
  confirmProcessBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
