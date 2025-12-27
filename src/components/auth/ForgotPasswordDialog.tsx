import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, KeyRound } from 'lucide-react';

export function ForgotPasswordDialog() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/settings/update-password',
      });

      if (error) throw error;

      toast.success(t('auth.reset_link_sent'), {
        description: t('auth.reset_link_sent_desc'),
      });
      setIsOpen(false);
      setEmail('');
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(t('common.error'), {
        description: error.message || t('common.error_friendly'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {t('auth.forgot_password')}
        </button>
      </DialogTrigger>
      {/* Estilo moderno: Borde muy redondeado, sin borde visible, sombra suave */}
      <DialogContent className="sm:max-w-md !rounded-3xl border-none shadow-2xl bg-card p-0 overflow-hidden">
        <div className="p-6 pb-0 flex flex-col items-center">
          {/* Icono decorativo */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          
          <DialogHeader className="mb-2 w-full">
            <DialogTitle className="text-center text-xl font-bold">{t('auth.reset_password_title')}</DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground mt-2">
              {t('auth.reset_password_desc')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all text-base"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t('auth.send_reset_link')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}