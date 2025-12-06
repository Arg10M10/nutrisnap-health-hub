import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export const useZxingScanner = (
  onScan: (result: string) => void,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScan = async () => {
      try {
        // Simplified logic: let the browser choose the default camera
        await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            onScan(result.getText());
          }
          // The NotFoundException is thrown when no barcode is found in a frame.
          // We don't want to treat this as an error, as it's expected behavior during scanning.
          // We check the error's name property instead of using instanceof.
          if (err && err.name !== 'NotFoundException') {
            console.error('Error de escaneo:', err);
            setError('Ocurrió un error durante el escaneo.');
          }
        });
      } catch (err) {
        console.error('Error al iniciar el escáner:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError("Permiso de cámara denegado. Habilítalo en la configuración de tu navegador.");
          } else {
            setError(err.message);
          }
        } else {
          setError("Un error desconocido ocurrió al iniciar la cámara.");
        }
      }
    };

    startScan();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [videoRef, onScan]);

  return { error };
};