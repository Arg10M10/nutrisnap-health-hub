import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { useTranslation, Trans } from 'react-i18next';

const TERMS_URL = "https://sites.google.com/view/calorel/termsandconditions";
const PRIVACY_URL = "https://sites.google.com/view/calorel/privacypolicy";

// Mismo ID que en strings.xml y capacitor.config.ts
const GOOGLE_CLIENT_ID = '522700969452-gof3re6i21fc0eotfbk4q496ke3gdl0k.apps.googleusercontent.com';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // No hacemos nada al montar para evitar crashes de inicio.
    // La inicialización será "Lazy" (perezosa) al hacer click.
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Paso 1: Inicialización defensiva
      // Solo inicializamos si estamos en nativo para asegurar que el plugin tenga la config
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }

      console.log("Iniciando GoogleAuth.signIn()...");
      const googleUser = await GoogleAuth.signIn();
      
      console.log('Respuesta completa de Google:', JSON.stringify(googleUser));

      const idToken = googleUser.authentication?.idToken || googleUser.idToken;

      if (!idToken) {
        throw new Error('No se recibió el ID Token de Google.');
      }

      console.log("ID Token recibido, enviando a Supabase...");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      
      if (error) {
        console.error("Error de Supabase:", error);
        throw error;
      }

      console.log("Sesión iniciada correctamente:", data);

    } catch (error: any) {
      console.error('Error General en Login:', error);
      // Mensaje amigable para el usuario, ignorando el error técnico
      toast.error(t('login.error_title'), { description: t('login.error_description') });
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
    // Abrir en una nueva pestaña/navegador del sistema
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2.5 pb-6 pt-8">
            <Leaf className="w-16 h-16 text-primary" />
            <div className="space-y-1.5 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-foreground">
                {t('login.welcome')}
              </h2>
              <p className="text-muted-foreground px-4">
                {t('login.subtitle')}
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 space-y-4">
            <Button 
              variant="outline"
              className="w-full h-16 text-lg rounded-full" 
              onClick={signInWithGoogle} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <img src="/google-logo.png" alt="Google logo" className="mr-3 h-6 w-6" />
                  {t('login.google_button')}
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center !py-6 mt-4">
            <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
              <Trans
                i18nKey="login.terms_privacy"
                components={{
                  1: (
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        openLink(TERMS_URL);
                      }}
                    />
                  ),
                  3: (
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        openLink(PRIVACY_URL);
                      }}
                    />
                  ),
                }}
              />
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}