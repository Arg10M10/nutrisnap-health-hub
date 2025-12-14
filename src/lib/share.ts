import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const shareElement = async (element: HTMLElement, fileName: string, title: string, text: string) => {
  try {
    // 1. Convertir el elemento DOM a Canvas
    const canvas = await html2canvas(element, {
      useCORS: true, // Permitir imágenes externas si las hay
      scale: 2, // Mejor resolución
      backgroundColor: '#ffffff', // Asegurar fondo blanco
      logging: false,
      imageTimeout: 15000, // Dar más tiempo para cargar imágenes
    });

    // 2. Obtener Base64 de la imagen
    const base64Data = canvas.toDataURL('image/jpeg', 0.8);

    // 3. Si es nativo (Android/iOS), guardar en sistema de archivos y compartir URI
    if (Capacitor.isNativePlatform()) {
      const savedFile = await Filesystem.writeFile({
        path: `${fileName}.jpg`,
        data: base64Data.split(',')[1], // Quitar el prefijo data:image/...
        directory: Directory.Cache,
      });

      await Share.share({
        title: title,
        text: text,
        files: [savedFile.uri],
      });
    } else {
      // 4. Fallback para Web: Compartir API si soporta archivos, o descargar
      const blob = await (await fetch(base64Data)).blob();
      const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title,
          text: text,
          files: [file],
        });
      } else {
        // Descargar si no se puede compartir
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = base64Data;
        link.click();
      }
    }
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};