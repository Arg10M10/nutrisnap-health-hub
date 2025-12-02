import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from 'sonner';

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.63 12.22c0-2.85-1.8-4.44-4.38-4.44-1.64 0-3.13.94-4.25.94-.97 0-2.25-.84-3.63-.84-2.58 0-4.63 1.88-4.63 4.71 0 3.11 2.12 6.2 4.38 6.2 1.47 0 2.62-.84 3.88-.84.97 0 2.62.84 4.12.84 2.25 0 4.5-2.62 4.5-6.57zm-11.5 6.2c.84 0 1.39-.53 2.25-.53.84 0 1.64.53 2.38.53.84 0 1.5-.63 2.25-1.64-1.12-.63-2.12-1.88-2.12-3.38 0-1.5 1-2.85 2.25-3.5-.84-.84-2.12-1-3.13-1-1.25 0-2.5.74-3.38.74-.97 0-2-.74-3.25-.74-1.64 0-3.13 1.12-3.88 2.62.63.38 1.25.84 1.25 1.88 0 1.64-1.25 2.62-2.62 3.13.25.13.5.25.74.38 1.13 1.59 2.5 2.18 3.88 2.18zM15.25 6.57c.74-.84 1.25-2 1-3.13-.84.13-1.88.74-2.62 1.64-.63.74-1.25 1.88-1 3 .84.13 1.88-.63 2.62-1.51z" />
  </svg>
);

export default function Login() {
  const [loading, setLoading] = useState(false);

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });
    if (error) {
      toast.error(error.message);
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
                Bienvenido a NutriSnap
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
              onClick={() => signInWithProvider('google')} 
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
            <Button 
              className="w-full h-16 text-lg rounded-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200" 
              onClick={() => signInWithProvider('apple')} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <AppleIcon className="mr-3 h-7 w-7" />
                  Continuar con Apple
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