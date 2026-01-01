import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, ArrowLeft, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getDeviceId } from '@/lib/device';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre es requerido.' }),
  lastName: z.string().min(2, { message: 'El apellido es requerido.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export const SignUpForm = ({ onSwitchToSignIn }: SignUpFormProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Password, 3: Name

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const validateStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await form.trigger('email');
    if (step === 2) isValid = await form.trigger('password');
    
    if (isValid) setStep(s => s + 1);
  };

  const goBack = () => setStep(s => s - 1);

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

      // 2. Proceder con el registro
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: `${values.firstName} ${values.lastName}`,
            device_id: deviceId,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        if (data.session) {
            toast.success(t('login.welcome'));
        } else {
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

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative min-h-[220px]">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center mb-6">
                <h3 className="text-lg font-semibold">¿Cuál es tu email?</h3>
                <p className="text-sm text-muted-foreground">Te enviaremos un enlace mágico o código.</p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          placeholder="tu@email.com" 
                          {...field} 
                          className="h-14 pl-10 text-lg bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all" 
                          autoFocus
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Button 
                  type="button" 
                  onClick={validateStep} 
                  className="w-full h-14 text-lg rounded-2xl"
                >
                  Continuar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    ¿Ya tienes una cuenta? <span className="font-semibold text-primary">Inicia Sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center mb-6">
                <h3 className="text-lg font-semibold">Crea una contraseña segura</h3>
                <p className="text-sm text-muted-foreground">Debe tener al menos 6 caracteres.</p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          className="h-14 pl-10 pr-10 text-lg bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
                          autoFocus
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={goBack} className="h-14 w-14 rounded-2xl shrink-0 p-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button type="button" onClick={validateStep} className="w-full h-14 text-lg rounded-2xl">
                  Continuar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center mb-6">
                <h3 className="text-lg font-semibold">¿Cómo te llamas?</h3>
                <p className="text-sm text-muted-foreground">Para dirigirnos a ti correctamente.</p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            placeholder="Nombre" 
                            {...field} 
                            className="h-14 pl-10 text-lg bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
                            autoFocus
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            placeholder="Apellido" 
                            {...field} 
                            className="h-14 pl-10 text-lg bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={goBack} className="h-14 w-14 rounded-2xl shrink-0 p-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button type="submit" disabled={loading} className="w-full h-14 text-lg rounded-2xl">
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Crear Cuenta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
};