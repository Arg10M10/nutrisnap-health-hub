import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // 1. Iniciar sesión con el Plugin Nativo
      console.log("Iniciando GoogleAuth.signIn()...");
      const googleUser = await GoogleAuth.signIn();
      
      console.log('Respuesta completa de Google:', JSON.stringify(googleUser));

      // 2. Extraer el ID Token. 
      // El plugin suele devolverlo en 'authentication.idToken', pero a veces en la raíz dependiendo de la versión.
      const idToken = googleUser.authentication?.idToken || googleUser.idToken;

      if (!idToken) {
        throw new Error('No se recibió el ID Token de Google. Revisa la consola para ver el objeto completo.');
      }

      console.log("ID Token recibido, enviando a Supabase...");

      // 3. Autenticar en Supabase usando el ID Token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken, // IMPORTANTE: Supabase v2 usa 'token', no 'id_token'
      });
      
      if (error) {
        console.error("Error de Supabase:", error);
        throw error;
      }

      console.log("Sesión iniciada correctamente:", data);

    } catch (error: any) {
      console.error('Error General en Login:', error);
      
      // Manejo de errores comunes
      let message = error.message || JSON.stringify(error);
      
      if (message.includes("10") || message.includes("Something went wrong")) {
        message = "Error de configuración de Google (Código 10). Verifica el SHA-1 en la consola de Google Cloud.";
      }

      toast.error('Error al iniciar sesión', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2.5 pb-6 pt-8">
            <Leaf className="w-16 h-16 text-primary" />
            <div className="space-y-1.5 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Bienvenido a Calorel
              </h2>
              <p className="text-muted-foreground px-4">
                Tu compañero de salud inteligente. Comienza tu viaje con un solo clic.
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
                  Continuar con Google
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center !py-6 mt-4">
            <p className="text-center text-xs text-muted-foreground px-4">
              Al continuar, aceptas nuestros{" "}
              <a href="#" className="text-primary hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidad
              </a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}