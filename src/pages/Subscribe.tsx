import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Lock, Bell, Sparkles, Zap, ChefHat, Target, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Subscribe = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user, refetchProfile } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [enableTrial, setEnableTrial] = useState(true);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      
      // En un escenario real, aquí se procesaría el pago o se crearía la suscripción en Stripe/RevenueCat
      // Si enableTrial es true, se crea con trial_end en el futuro.
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_subscribed: true })
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      const message = enableTrial 
        ? t('subscribe.trial_started', "¡Prueba de 3 días iniciada!") 
        : t('subscribe.success_toast', "¡Plan Premium activado!");
      toast.success(message);
      navigate('/');
    },
    onError: () => {
      toast.error(t('common.error_friendly'));
    }
  });

  const handleSubscribe = () => {
    // Si es invitado, redirigir a registro antes de "pagar" (simulado)
    if (profile?.is_guest) {
      navigate('/register-premium');
    } else {
      subscribeMutation.mutate();
    }
  };

  const handleSkip = () => {
    navigate('/goal-projection');
  };

  const premiumFeatures = [
    { icon: Sparkles, text: t('subscribe.features.scanner') },
    { icon: Zap, text: t('subscribe.features.exercise') },
    { icon: ChefHat, text: t('subscribe.features.diet_plans') },
    { icon: Target, text: t('subscribe.features.goals') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Precios
  const annualPrice = "$36.00";
  const annualMonthlyEquivalent = "$3.00";
  const monthlyPrice = "$9.00";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{t('subscribe.title')}</h1>
          <p className="text-muted-foreground">{t('subscribe.subtitle')}</p>
        </div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {premiumFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50" 
              variants={itemVariants}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                <feature.icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-foreground leading-tight">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline Visual (Sólo visible si Trial está activo) */}
        <div className={cn("relative pl-4 space-y-6 py-2 transition-all duration-300 overflow-hidden", enableTrial ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
          <div className="absolute left-[1.15rem] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
          
          <div className="relative flex items-center gap-4">
            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{t('subscribe.timeline.today_title')}</h3>
              <p className="text-xs text-muted-foreground">{t('subscribe.timeline.today_desc')}</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background border border-border">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{t('subscribe.timeline.reminder_title')}</h3>
              <p className="text-xs text-muted-foreground">{t('subscribe.timeline.reminder_desc')}</p>
            </div>
          </div>
        </div>

        {/* Trial Toggle */}
        <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="trial-mode" className="text-sm font-semibold text-foreground">
              {t('subscribe.enable_trial', "Habilitar prueba de 3 días")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('subscribe.enable_trial_desc', "Pruébalo gratis antes de pagar")}
            </p>
          </div>
          <Switch 
            id="trial-mode" 
            checked={enableTrial}
            onCheckedChange={setEnableTrial}
          />
        </div>

        {/* Plan Selector */}
        <div className="space-y-3">
          {/* Annual Plan ($3/mo) */}
          <motion.div 
            className={cn(
              "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm",
              selectedPlan === 'annual' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/50"
            )}
            onClick={() => setSelectedPlan('annual')}
            whileTap={{ scale: 0.98 }}
          >
            <div className="bg-primary text-white text-center py-1 text-[10px] font-bold tracking-wide uppercase">
              {t('subscribe.best_value')}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  {selectedPlan === 'annual' && <Check className="w-4 h-4 text-primary" />}
                  {t('subscribe.plan.annual')}
                </span>
                <span className="text-xs text-muted-foreground line-through">$108.00</span>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary">{annualMonthlyEquivalent}</span>
                  <span className="text-xs font-medium text-muted-foreground">/{t('subscribe.month_short')}</span>
                </div>
                <span className="text-[10px] font-semibold text-foreground/70">
                  {enableTrial 
                    ? t('subscribe.billed_yearly', { price: annualPrice }) 
                    : `${annualPrice} facturado hoy`
                  }
                </span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Plan ($9/mo) */}
          <motion.div 
            className={cn(
              "relative rounded-xl border-2 bg-card p-4 flex items-center justify-between cursor-pointer transition-all",
              selectedPlan === 'monthly' ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/50"
            )}
            onClick={() => setSelectedPlan('monthly')}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-primary" />}
              <span className="text-sm font-bold text-foreground">{t('subscribe.plan.monthly')}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-base font-bold text-foreground">{monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/{t('subscribe.month_short')}</span></span>
                {!enableTrial && <span className="text-[10px] font-semibold text-foreground/70">Facturado hoy</span>}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button 
            onClick={handleSubscribe} 
            size="lg" 
            disabled={subscribeMutation.isPending}
            className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/25 font-bold"
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : enableTrial ? (
              t('subscribe.buttons.start_trial')
            ) : (
              selectedPlan === 'annual' 
                ? t('subscribe.buttons.pay_now', { price: annualPrice }) 
                : t('subscribe.buttons.pay_now', { price: monthlyPrice })
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            {enableTrial 
              ? t('subscribe.no_charge_text') 
              : t('subscribe.immediate_charge_text', "El cargo se realizará inmediatamente.")
            }
          </p>

          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground h-10 text-sm"
          >
            {t('subscribe.continue_limited')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscribe;