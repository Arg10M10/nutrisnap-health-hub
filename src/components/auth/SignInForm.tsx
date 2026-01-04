import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { useNavigate } from 'react-router-dom';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

export const SignInForm = ({ onSwitchToSignUp }: SignInFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: t('auth.error_email_invalid') }),
    password: z.string().min(1, { message: t('auth.error_password_empty') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (data.user) {
      // Éxito: Redirigir al inicio
      navigate('/', { replace: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="space-y-2 text-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">{t('login.welcome_back')}</h3>
          <p className="text-muted-foreground">{t('login.enter_details')}</p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t('auth.email_label')}</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder={t('auth.email_placeholder')} 
                    {...field} 
                    className="h-14 pl-10 text-lg bg-background border-input px-4 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/50" 
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="sr-only">{t('auth.password_label')}</FormLabel>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password_input_placeholder')}
                    {...field}
                    className="h-14 pl-10 pr-12 text-lg bg-background border-input px-4 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
              <div className="flex justify-end mt-1">
                <ForgotPasswordDialog />
              </div>
            </FormItem>
          )}
        />
        
        <div className="space-y-4 pt-4">
          <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium rounded-lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.sign_in_action')}
          </Button>
        </div>
      </form>
    </Form>
  );
};