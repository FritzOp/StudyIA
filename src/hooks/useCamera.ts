import { useCallback, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useCameraPermissions, type CameraType, type CameraView } from 'expo-camera';

export type PermissionState = 'checking' | 'granted' | 'undetermined' | 'denied' | 'blocked';

/** Ciclo de permisos de la cámara (Semana 6): verificar, solicitar y redirigir a Ajustes. */
export function useCameraAccess() {
  const [permission, requestPermission] = useCameraPermissions();

  const permissionState: PermissionState = !permission
    ? 'checking'
    : permission.granted
      ? 'granted'
      : !permission.canAskAgain
        ? 'blocked'
        : permission.status === 'undetermined'
          ? 'undetermined'
          : 'denied';

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    if (permissionState === 'granted') return true;
    if (permissionState === 'blocked') {
      Alert.alert(
        'Permiso de cámara requerido',
        'StudyIA necesita la cámara para escanear apuntes. Habilítala en los ajustes de tu teléfono. También puedes elegir una foto de la galería.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    const result = await requestPermission();
    return result.granted;
  }, [permissionState, requestPermission]);

  return { permissionState, ensurePermission };
}

/** Control de la cámara mientras está abierta: orientación, disparo y estado de captura. */
export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || !isReady || isCapturing) return null;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      return photo?.uri ?? null;
    } catch {
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isReady, isCapturing]);

  return {
    cameraRef,
    facing,
    toggleFacing,
    onCameraReady: () => setIsReady(true),
    onCameraClosed: () => setIsReady(false),
    takePhoto,
    isCapturing,
  };
}
