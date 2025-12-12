import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';

export const StatusBarSync = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Solo ejecutar en dispositivos nativos (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      const updateStatusBar = async () => {
        try {
          if (resolvedTheme === 'dark') {
            // Tema Oscuro: Fondo oscuro, Texto claro
            await StatusBar.setStyle({ style: Style.Dark });
            // Color de fondo aproximado al tema oscuro de la app (hsl(220 15% 6%))
            await StatusBar.setBackgroundColor({ color: '#0d1116' }); 
          } else {
            // Tema Claro: Fondo blanco, Texto oscuro
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
          }
        } catch (e) {
          console.error('Error actualizando barra de estado:', e);
        }
      };
      
      updateStatusBar();
    }
  }, [resolvedTheme]);

  return null;
};