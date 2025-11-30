import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

const Logo = () => <Leaf className="w-12 h-12 text-primary" />;

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-4.82 2.04-5.82 0-9.6-4.16-9.6-9.6s3.78-9.6 9.6-9.6c2.93 0 5.32 1.15 6.92 2.68L22 2.92C19.43 1.12 16.25 0 12.48 0 5.88 0 .02 5.82.02 12.54s5.86 12.54 12.46 12.54c3.33 0 6.08-1.06 8.04-3.02 2.05-2.05 2.98-5.08 2.98-8.58 0-.77-.08-1.48-.2-2.16H12.48z" fill="currentColor"/>
  </svg>
);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!firstName || !lastName) {
        toast.error("Por favor, introduce tu nombre y apellido.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("¡Revisa tu correo para verificar tu cuenta!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("¡Bienvenido de vuelta!");
      }
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg pb-0">
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-6">
            <Logo />
            <div className="space-y-0.5 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {isSignUp ? 'Crea una cuenta' : 'Inicia Sesión'}
              </h2>
              <p className="text-muted-foreground text-center px-4">
                {isSignUp ? '¡Bienvenido! Regístrate para empezar tu viaje saludable.' : 'Ingresa tus credenciales para continuar.'}
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleAuthAction} className="space-y-6">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    Acepto los{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Términos
                    </Link>
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Crear cuenta gratis' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  O
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
              <GoogleIcon />
              Continuar con Google
            </Button>

          </CardContent>
          <CardFooter className="flex justify-center border-t !py-4 mt-6">
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <Button variant="link" className="pl-1" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}