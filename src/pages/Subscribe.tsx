import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Bell, ShoppingBag, Sparkles, Clock, Zap, ChefHat, Target, Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Subscribe = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refetchProfile } = useAuth();
  const [planType, setPlanType] = useState<'trial' | 'paid'>('trial');

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not found");
      
      // En un escenario real, aquí iría la integración con Stripe/RevenueCat
      // Por ahora, simulamos el éxito actualizando la DB
      const { error } = await supabase
        .from('profiles')
        .update({ is_subscribed: true })
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success("¡Suscripción activada!");
      // Navigate to plan generation screen
      navigate('/generating-plan');
    },
    onError: (error) => {
      console.error("Subscription error:", error);
      toast.error("Error al procesar la suscripción. Intenta de nuevo.");
    }
  });

  const handleSubscribe = () => {
    subscribeMutation.mutate();
  };

  const timelineItems = [
    {
      icon: Lock,
      title: t('subscribe.timeline.today_title'),
      description: t('subscribe.timeline.today_desc'),
    },
    {
      icon: Bell,
      title: t('subscribe.timeline.reminder_title'),
      description: t('subscribe.timeline.reminder_desc'),
    },
    {
      icon: ShoppingBag,
      title: t('subscribe.timeline.billing_title'),
      description: t('subscribe.timeline.billing_desc'),
    },
  ];

  const premiumFeatures = [
    { icon: Sparkles, text: t('subscribe.features.scanner') },
    { icon: Zap, text: t('subscribe.features.exercise') },
    { icon: ChefHat, text: t('subscribe.features.diet_plans') },
    { icon: Target, text: t('subscribe.features.goals') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-end bg-background p-4 sm:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="p-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('subscribe.title')}</h1>
        </div>

        <ToggleGroup
          type="single"
          value={planType}
          onValueChange={(value: 'trial' | 'paid') => value && setPlanType(value)}
          className="grid grid-cols-2 w-full mb-8"
        >
          <ToggleGroupItem value="trial" className="h-auto min-h-[3rem] text-base py-2">{t('subscribe.trial_tab')}</ToggleGroupItem>
          <ToggleGroupItem value="paid" className="h-auto min-h-[3rem] text-base py-2">{t('subscribe.pay_now_tab')}</ToggleGroupItem>
        </ToggleGroup>

        {planType === 'trial' ? (
          <motion.div 
            key="trial"
            className="relative space-y-8 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="absolute left-6 top-2 h-full w-0.5 bg-primary/20 -translate-x-1/2" />
            {timelineItems.map((item, index) => (
              <motion.div key={index} className="relative flex items-start gap-4" variants={itemVariants}>
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card border-4 border-background flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="paid"
            className="mb-8 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h3 className="text-center font-semibold text-lg text-foreground">{t('subscribe.features_title')}</h3>
            {premiumFeatures.map((feature, index) => (
              <motion.div key={index} className="flex items-center gap-4" variants={itemVariants}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <feature.icon className="h-5 w-5" />
                </div>
                <p className="text-foreground">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="border-2 border-primary bg-primary/5 rounded-lg p-4 text-center">
              <p className="font-bold text-lg text-primary">{t('subscribe.plan.title')}</p>
              <p className="text-2xl font-extrabold text-foreground">$2.00<span className="text-base font-medium text-muted-foreground">{t('subscribe.plan.price_suffix')}</span></p>
              {planType === 'trial' && <p className="text-sm text-muted-foreground mt-1">{t('subscribe.plan.trial_note')}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Button 
            onClick={handleSubscribe} 
            size="lg" 
            disabled={subscribeMutation.isPending}
            className="w-full h-auto min-h-[3.5rem] text-lg rounded-xl shadow-lg shadow-primary/30 py-2 whitespace-normal"
          >
            {subscribeMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
            {planType === 'trial' ? t('subscribe.buttons.start_trial') : t('subscribe.buttons.unlock_now')}
          </Button>
          {planType === 'trial' && (
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {t('subscribe.buttons.no_payment_note')}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Subscribe;