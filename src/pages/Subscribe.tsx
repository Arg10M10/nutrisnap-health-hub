import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Lock, Bell, X } from 'lucide-react';
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
    if (profile?.is_guest) {
      navigate('/register-premium');
    } else {
      subscribeMutation.mutate();
    }
  };

  const handleSkip = () => {
    navigate('/goal-projection');
  };

  // Precios
  const annualPrice = "$36.00";
  const annualMonthlyEquivalent = "$3.00";
  const monthlyPrice = "$9.00";

  const benefits = [
    { name: t('subscribe.features.scanner'), free: false, premium: true },
    { name: t('subscribe.features.diet_plans'), free: false, premium: true },
    { name: t('subscribe.features.exercise'), free: false, premium: true },
    { name: t('subscribe.features.menu_analysis', 'Análisis de Menús'), free: false, premium: true },
    { name: t('subscribe.features.tracking', 'Registro Básico'), free: true, premium: true },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{t('subscribe.title')}</h1>
          <p className="text-muted-foreground">{t('subscribe.subtitle')}</p>
        </div>

        {/* Trial Switch */}
        <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="trial-mode" className="text-sm font-semibold text-foreground">
              {t('subscribe.enable_trial')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('subscribe.enable_trial_desc')}
            </p>
          </div>
          <Switch 
            id="trial-mode" 
            checked={enableTrial}
            onCheckedChange={setEnableTrial}
          />
        </div>

        <AnimatePresence mode="wait">
          {enableTrial ? (
            /* --- VISTA DE PRUEBA (Timeline) --- */
            <motion.div
              key="trial-view"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative pl-4 space-y-8 py-4 ml-4 border-l-2 border-primary/20">
                {/* Hoy */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="pl-4">
                    <h3 className="font-bold text-base text-foreground">{t('subscribe.timeline.today_title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subscribe.timeline.today_desc')}</p>
                  </div>
                </div>

                {/* Recordatorio */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background border border-border">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="pl-4">
                    <h3 className="font-semibold text-base text-foreground">{t('subscribe.timeline.reminder_title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subscribe.timeline.reminder_desc')}</p>
                  </div>
                </div>

                {/* Cobro */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background border border-border">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="pl-4">
                    <h3 className="font-semibold text-base text-foreground">{t('subscribe.timeline.billing_title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subscribe.timeline.billing_desc')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* --- VISTA DE COMPRA (Tabla + Precios) --- */
            <motion.div
              key="pay-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Tabla Comparativa */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] border-b border-border bg-muted/30">
                  <div className="p-3"></div>
                  <div className="p-3 text-center text-xs font-bold text-muted-foreground tracking-wider self-center uppercase">{t('subscribe.plan_free', 'Gratis')}</div>
                  <div className="p-3 text-center text-xs font-bold text-primary-foreground bg-primary/90 tracking-wider self-center uppercase">{t('subscribe.plan_premium', 'Premium')}</div>
                </div>

                {benefits.map((benefit, index) => (
                  <div key={index} className="grid grid-cols-[1.5fr_0.8fr_0.8fr] border-b border-border/50 last:border-0 items-center min-h-[3rem]">
                    <div className="px-4 py-2 text-xs font-medium text-foreground leading-tight">
                      {benefit.name}
                    </div>
                    <div className="flex justify-center py-2">
                      {benefit.free ? <Check className="w-4 h-4 text-muted-foreground" /> : <X className="w-4 h-4 text-muted-foreground/30" />}
                    </div>
                    <div className="flex justify-center bg-primary/5 h-full items-center py-2">
                      {benefit.premium && (
                        <div className="bg-primary rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3 text-white" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selector de Precios */}
              <div className="space-y-3">
                {/* Anual Plan */}
                <div 
                  className={cn(
                    "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm",
                    selectedPlan === 'annual' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/50"
                  )}
                  onClick={() => setSelectedPlan('annual')}
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
                        {annualPrice} {t('subscribe.billed_yearly_simple', 'facturado hoy')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monthly Plan */}
                <div 
                  className={cn(
                    "relative rounded-xl border-2 bg-card p-4 flex items-center justify-between cursor-pointer transition-all",
                    selectedPlan === 'monthly' ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  <div className="flex items-center gap-2">
                    {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-primary" />}
                    <span className="text-sm font-bold text-foreground">{t('subscribe.plan.monthly')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                      <span className="text-base font-bold text-foreground">{monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/{t('subscribe.month_short')}</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions Footer */}
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
              : t('subscribe.immediate_charge_text')
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
      </div>
    </div>
  );
};

export default Subscribe;