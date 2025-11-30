import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Leaf } from 'lucide-react';

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Leaf className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">
            Bienvenido a NutriSnap
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Inicia sesión para comenzar tu viaje saludable.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Iniciar Sesión',
                  social_provider_text: 'Continuar con {{provider}}',
                  link_text: '¿Ya tienes una cuenta? Inicia sesión',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Registrarse',
                  social_provider_text: 'Continuar con {{provider}}',
                  link_text: '¿No tienes una cuenta? Regístrate',
                },
                forgotten_password: {
                  email_label: 'Correo electrónico',
                  button_label: 'Enviar instrucciones',
                  link_text: '¿Olvidaste tu contraseña?',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;