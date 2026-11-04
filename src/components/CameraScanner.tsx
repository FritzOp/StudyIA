import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CameraView, type FlashMode } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RippleButton } from '@/components/motion';
import { useCamera } from '@/hooks/useCamera';

const RETICLE_HEIGHT = 300;

/** Cámara de pantalla completa: captura, vista previa y confirmación. */
export function CameraScanner({
  visible,
  subjectName,
  onClose,
  onConfirm,
  onPickGallery,
}: {
  visible: boolean;
  subjectName: string;
  onClose: () => void;
  onConfirm: (uri: string) => void;
  onPickGallery: () => void;
}) {
  const { cameraRef, facing, toggleFacing, onCameraReady, onCameraClosed, takePhoto, isCapturing } = useCamera();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [preview, setPreview] = useState<string | null>(null);
  const laser = useSharedValue(0);

  useEffect(() => {
    if (!visible || preview || reduced) {
      laser.set(0);
      return;
    }
    laser.set(withRepeat(withTiming(RETICLE_HEIGHT - 4, { duration: 2200 }), -1, true));
  }, [visible, preview, reduced, laser]);

  const laserStyle = useAnimatedStyle(() => ({ transform: [{ translateY: laser.get() }] }));

  const close = () => {
    setPreview(null);
    onCameraClosed();
    onClose();
  };

  const capture = async () => {
    const uri = await takePhoto();
    if (uri) setPreview(uri);
  };

  const flashIcon = flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-auto' : 'flash-off';

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        {preview ? (
          <View style={[styles.preview, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.previewTitle}>¿Se lee bien?</Text>
            <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.previewActions}>
              <View style={styles.flex}>
                <RippleButton label="Repetir" icon="refresh" variant="soft" onPress={() => setPreview(null)} />
              </View>
              <View style={styles.flexWide}>
                <RippleButton
                  label="Usar esta foto"
                  icon="check"
                  onPress={() => {
                    const uri = preview;
                    setPreview(null);
                    onCameraClosed();
                    onConfirm(uri);
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* CameraView no admite hijos: los controles van como hermanos absolutos. */}
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flash}
              onCameraReady={onCameraReady}
            />
            <View
              style={[styles.overlay, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 18 }]}
            >
              <View style={styles.topBar}>
                <RoundButton icon="close" label="Cerrar cámara" onPress={close} />
                <View style={[styles.subjectBadge, { maxWidth: width * 0.45 }]}>
                  <MaterialCommunityIcons name="book-open-outline" size={14} color="#A5B4FC" />
                  <Text style={styles.subjectText} numberOfLines={1}>
                    {subjectName}
                  </Text>
                </View>
                <View style={styles.topRight}>
                  <RoundButton
                    icon={flashIcon}
                    label="Cambiar flash"
                    color={flash === 'off' ? '#FFFFFF' : '#FBBF24'}
                    onPress={() =>
                      setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))
                    }
                  />
                  <RoundButton icon="camera-flip-outline" label="Voltear cámara" onPress={toggleFacing} />
                </View>
              </View>

              <View style={styles.center}>
                <View style={[styles.reticle, { width: width * 0.86, height: RETICLE_HEIGHT }]}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  <Animated.View style={[styles.laser, laserStyle]} />
                </View>
                <Text style={styles.tip}>Alinea el apunte dentro del marco, con buena luz</Text>
              </View>

              <View style={styles.bottomBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Elegir de la galería"
                  style={styles.side}
                  onPress={onPickGallery}
                >
                  <MaterialCommunityIcons name="image-multiple-outline" size={26} color="#FFFFFF" />
                  <Text style={styles.sideLabel}>Galería</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tomar foto"
                  disabled={isCapturing}
                  onPress={capture}
                  style={[styles.shutterOuter, isCapturing && styles.shutterBusy]}
                >
                  <View style={styles.shutterInner}>
                    <MaterialCommunityIcons name="camera" size={26} color="#6366F1" />
                  </View>
                </Pressable>
                <View style={styles.side} />
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

function RoundButton({
  icon,
  label,
  color = '#FFFFFF',
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.round}>
      <MaterialCommunityIcons name={icon} size={23} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E1A' },
  flex: { flex: 1 },
  flexWide: { flex: 2 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', paddingHorizontal: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topRight: { flexDirection: 'row', gap: 8 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  subjectText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700', flexShrink: 1 },
  center: { alignItems: 'center' },
  reticle: { overflow: 'hidden', borderRadius: 18 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#818CF8' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  laser: { position: 'absolute', top: 0, left: 10, right: 10, height: 3, borderRadius: 2, backgroundColor: '#818CF8' },
  tip: {
    color: '#E0E7FF',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  side: { width: 64, alignItems: 'center' },
  sideLabel: { color: '#E2E8F0', fontSize: 11, marginTop: 4, fontWeight: '600' },
  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBusy: { opacity: 0.5 },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { flex: 1, paddingHorizontal: 18, gap: 14, backgroundColor: '#0F172A' },
  previewTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  previewImage: { flex: 1, borderRadius: 16, backgroundColor: '#1E293B' },
  previewActions: { flexDirection: 'row', gap: 12 },
});
