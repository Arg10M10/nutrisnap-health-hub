import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getDeviceId } from '@/lib/device';
import { motion, AnimatePresence } from 'framer-motion';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onSuccess?: (userId: string) => void;
}

export const SignUpForm = ({ onSwitchToSignIn, onSuccess }: SignUpFormProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const formSchema = z.object({
    firstName: z.string().min(2, { message: t('auth.error_first_name_required') }),
    lastName: z.string().min(2, { message: t('auth.error_last_name_required') }),
    email: z.string().email({ message: t('auth.error_email_invalid') }),
    password: z.string().min(6, { message: t('auth.error_password_length') }),
  });

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

      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-device-limit', {
        body: { deviceId }
      });

      if (checkError) throw new Error(t('common.error_friendly'));
      
      if (!checkData.allowed) {
        toast.error(t('auth.limit_reached_title'), {
          description: checkData.message || t('auth.limit_reached_desc')
        });
        setLoading(false);
        return;
      }

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
        if (data.user) {
            if (onSuccess) {
                onSuccess(data.user.id);
            } else {
                toast.success(t('auth.signup_success_toast'));
            }
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || t('common.error_friendly'));
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative min-h-[300px] flex flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.2 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight">{t('auth.step_email_title')}</h3>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder={t('auth.email_placeholder')} 
                        {...field} 
                        className="h-14 text-lg bg-background border-input px-4 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all text-center placeholder:text-muted-foreground/50" 
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="button" 
                  onClick={validateStep} 
                  className="w-full h-14 text-lg font-medium rounded-lg"
                >
                  {t('common.continue')}
                </Button>
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
              transition={{ type: "tween", duration: 0.2 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight">{t('auth.step_password_title')}</h3>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.password_placeholder')}
                          {...field}
                          className="h-14 text-lg bg-background border-input px-4 pr-12 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all text-center placeholder:text-muted-foreground/50"
                          autoFocus
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button type="button" onClick={validateStep} className="w-full h-14 text-lg font-medium rounded-lg">
                  {t('common.continue')}
                </Button>
                <Button type="button" variant="ghost" onClick={goBack} className="w-full h-12 text-muted-foreground hover:text-foreground rounded-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
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
              transition={{ type: "tween", duration: 0.2 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight">{t('auth.step_name_title')}</h3>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.first_name_placeholder')} 
                          {...field} 
                          className="h-14 text-lg bg-background border-input px-4 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all text-center placeholder:text-muted-foreground/50"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.last_name_placeholder')} 
                          {...field} 
                          className="h-14 text-lg bg-background border-input px-4 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all text-center placeholder:text-muted-foreground/50"
                        />
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-medium rounded-lg">
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {t('auth.create_account_action')}
                </Button>
                <Button type="button" variant="ghost" onClick={goBack} className="w-full h-12 text-muted-foreground hover:text-foreground rounded-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
};