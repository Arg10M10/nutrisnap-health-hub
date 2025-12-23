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
const GOOGLE_CLIENT_ID = '733617800360-gdfv4o8j13anns76lj1hmf64deeuo8iq.apps.googleusercontent.com';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Inicializamos el plugin de Google Auth al montar el componente en plataformas nativas.
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // La inicialización ya se hizo en el useEffect para nativo.
      // Para web, se hace en App.tsx. Simplemente llamamos a signIn.
      const googleUser = await GoogleAuth.signIn();
      
      const idToken = googleUser.authentication?.idToken || googleUser.idToken;

      if (!idToken) {
        throw new Error('No se recibió el ID Token de Google.');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      
      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Error durante el inicio de sesión con Google:', error);
      // El código 12501 significa que el usuario canceló el inicio de sesión. No mostramos error en ese caso.
      if (error.code !== 12501) {
        toast.error(t('login.error_toast_title'), { 
          description: t('login.error_toast_desc'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
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