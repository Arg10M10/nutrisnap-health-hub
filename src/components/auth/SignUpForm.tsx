import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getDeviceId } from '@/lib/device';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre es requerido.' }),
  lastName: z.string().min(2, { message: 'El apellido es requerido.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export const SignUpForm = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();

      // 1. Verificar límite de cuentas por dispositivo
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-device-limit', {
        body: { deviceId }
      });

      if (checkError) throw new Error("Error verificando dispositivo. Intenta de nuevo.");
      
      if (!checkData.allowed) {
        toast.error("Límite de Cuentas Alcanzado", {
          description: checkData.message || "No puedes crear más cuentas en este dispositivo."
        });
        setLoading(false);
        return;
      }

      // 2. Proceder con el registro enviando el deviceId en metadata
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: `${values.firstName} ${values.lastName}`,
            device_id: deviceId, // Esto activará el trigger en la BD
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Registro exitoso
        if (data.session) {
            toast.success(t('login.welcome'));
        } else {
            // Caso donde la confirmación de email podría estar activa pero no queremos bloquear la UI
            toast.success("Cuenta creada correctamente. ¡Bienvenido!");
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.first_name_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.first_name_placeholder')} {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.last_name_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.last_name_placeholder')} {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email_label')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@ejemplo.com" {...field} className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.password_label')}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                    className="h-12 text-base pr-10"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.sign_up_button')}
        </Button>
      </form>
    </Form>
  );
};