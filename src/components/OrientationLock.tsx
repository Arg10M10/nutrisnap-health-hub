import { useEffect } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

const OrientationLock = () => {
  useEffect(() => {
    const lockOrientation = async () => {
      // Intentamos bloquear la orientación solo si es una plataforma nativa (iOS/Android)
      // o si el navegador lo soporta (PWA instalada)
      if (Capacitor.isNativePlatform()) {
        try {
          await ScreenOrientation.lock({ orientation: 'portrait' });
        } catch (error) {
          console.error('No se pudo bloquear la orientación de pantalla:', error);
        }
      }
    };

    lockOrientation();
  }, []);

  return null;
};

export default OrientationLock;