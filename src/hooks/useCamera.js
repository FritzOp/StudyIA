import { useState, useRef, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export function useCamera() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  // Mapeo detallado de estados de permisos como en el taller de sensores
  const permissionState = !permission
    ? 'checking'
    : permission.granted
    ? 'granted'
    : !permission.canAskAgain
    ? 'blocked'
    : permission.status === 'undetermined'
    ? 'undetermined'
    : 'denied';

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Solicitar permiso de cámara con diálogo explicativo si fue denegado previamente
  const ensureCameraPermission = useCallback(async () => {
    if (permissionState === 'granted') return true;

    if (permissionState === 'blocked') {
      Alert.alert(
        'Permiso de Cámara Requerido',
        'StudyIA necesita acceso a la cámara para escanear apuntes. Por favor habilítalo en la configuración de tu teléfono.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configuración', onPress: openSettings },
        ]
      );
      return false;
    }

    const result = await requestPermission();
    return result.granted;
  }, [permissionState, requestPermission, openSettings]);

  // Capturar foto desde la vista en vivo de la cámara
  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || !isReady || isCapturing) return null;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
      return photo ?? null;
    } catch (err) {
      console.warn('Error capturando foto:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isReady, isCapturing]);

  // Selección alternativa desde la galería de fotos
  const pickImageFromGallery = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setPhotoUri(selectedUri);
        return selectedUri;
      }
      return null;
    } catch (err) {
      console.warn('Error seleccionando imagen:', err);
      return null;
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhotoUri(null);
  }, []);

  return {
    cameraRef,
    permissionState,
    permission,
    requestPermission,
    ensureCameraPermission,
    openSettings,
    facing,
    toggleFacing,
    onCameraReady: () => setIsReady(true),
    takePhoto,
    pickImageFromGallery,
    photoUri,
    setPhotoUri,
    clearPhoto,
    isCapturing,
    isReady,
  };
}
