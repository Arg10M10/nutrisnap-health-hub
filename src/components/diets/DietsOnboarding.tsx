import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Wand2, Loader2, ArrowLeft, ArrowRight, Activity, ChefHat, Wallet, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useAILimit } from '@/hooks/useAILimit';
import { useTranslation } from 'react-i18next';
import { CountrySelector } from './CountrySelector';
import GeneratingDietPlan from './GeneratingDietPlan';

const formSchema = z.object({
  country: z.string().min(1, "Country is required"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'high']),
  preferences: z.array(z.string()).optional(),
  cookingTime: z.enum(['low', 'medium', 'high']),
  budget: z.enum(['low', 'medium', 'high']),
});

const TOTAL_STEPS = 4;

export const DietsOnboarding = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { checkLimit, logUsage } = useAILimit();
  
  // Estado para controlar la animación y la finalización
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiFinished, setApiFinished] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  
  const preferencesOptions = [
    { id: 'vegetarian', label: t('diets_onboarding.preferences.vegetarian'), icon: '🥗' },
    { id: 'lactose_free', label: t('diets_onboarding.preferences.lactose_free'), icon: '🥛' },
    { id: 'sugar_free', label: t('diets_onboarding.preferences.sugar_free'), icon: '🍬' },
    { id: 'gluten_free', label: t('diets_onboarding.preferences.gluten_free'), icon: '🍞' },
  ];
  
  const activityOptions = [
    { id: 'sedentary', label: t('diets_onboarding.activity.sedentary'), desc: t('diets_onboarding.activity.sedentary_desc') },
    { id: 'light', label: t('diets_onboarding.activity.light'), desc: t('diets_onboarding.activity.light_desc') },
    { id: 'moderate', label: t('diets_onboarding.activity.moderate'), desc: t('diets_onboarding.activity.moderate_desc') },
    { id: 'high', label: t('diets_onboarding.activity.high'), desc: t('diets_onboarding.activity.high_desc') },
  ];
  
  const levelOptions = [
    { id: 'low', label: t('diets_onboarding.levels.low') },
    { id: 'medium', label: t('diets_onboarding.levels.medium') },
    { id: 'high', label: t('diets_onboarding.levels.high') },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      activityLevel: 'light',
      preferences: [],
      cookingTime: 'medium',
      budget: 'medium',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user || !profile?.goal) throw new Error("Perfil incompleto");

      const { data: plan, error: planError } = await supabase.functions.invoke('generate-diet-plan', {
        body: { 
          ...values, 
          goal: profile.goal,
          language: i18n.language 
        },
      });
      if (planError) throw new Error(`IA Error: ${planError.message}`);

      const { error: dbError } = await supabase.from('weekly_diet_plans').insert({
        user_id: user.id,
        plan_data: plan,
      });
      if (dbError) throw dbError;

      const { error: profileError } = await supabase.from('profiles').update({
        diet_onboarding_completed: true,
      }).eq('id', user.id);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      // Marcar API como terminada, pero esperar a la animación
      setApiFinished(true);
    },
    onError: (error) => {
      setIsGenerating(false); // Cancelar animación si falla
      console.error("Diet generation error:", error);
      toast.error(t('diets_onboarding.toast_error_title'), { description: t('common.error_friendly') });
    },
  });

  // Efecto para finalizar todo cuando ambas condiciones se cumplen
  useEffect(() => {
    if (apiFinished && animationFinished) {
      const finalize = async () => {
        logUsage('diet_plan');
        await refetchProfile();
        queryClient.invalidateQueries({ queryKey: ['weekly_diet_plan', user?.id] });
        toast.success(t('diets_onboarding.toast_success'));
      };
      finalize();
    }
  }, [apiFinished, animationFinished, logUsage, refetchProfile, queryClient, t, user?.id]);

  const handleGenerate = async (values: z.infer<typeof formSchema>) => {
    const canProceed = await checkLimit('diet_plan', 1, 'weekly', t('common.ai_limit_reached'));
    if (canProceed) {
      setIsGenerating(true);
      mutation.mutate(values);
    }
  };

  const nextStep = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    let isValid = false;
    if (step === 1) isValid = await form.trigger('country');
    else isValid = true; 

    if (isValid) {
      setStep(s => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setStep(s => Math.max(s - 1, 1));
  };

  const BigOptionButton = ({ selected, onClick, label, desc, icon }: { selected: boolean; onClick: () => void; label: string; desc?: string; icon?: React.ReactNode; }) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left relative overflow-hidden",
        selected ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/30 bg-card"
      )}
    >
      <div className="flex items-center gap-4 z-10">
        {icon && <div className={cn("p-2 rounded-full", selected ? "bg-white text-primary" : "bg-muted text-muted-foreground")}>{icon}</div>}
        <div>
          <p className={cn("font-bold text-lg", selected ? "text-primary" : "text-foreground")}>{label}</p>
          {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {selected && <div className="bg-primary text-white rounded-full p-1 z-10"><Check className="w-5 h-5" /></div>}
    </button>
  );

  // Si estamos generando, mostrar la pantalla de animación
  if (isGenerating) {
    return (
      <GeneratingDietPlan 
        countryValue={form.getValues('country')} 
        onAnimationComplete={() => setAnimationFinished(true)} 
      />
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col min-h-[80vh]">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          ) : <div className="w-10" />}
          
          <h1 className="text-xl font-bold text-center">
            {step === 1 && t('diets_onboarding.step_country_title') || "País"}
            {step === 2 && t('diets_onboarding.step1_title')}
            {step === 3 && t('diets_onboarding.step2_title')}
            {step === 4 && t('diets_onboarding.step3_title')}
          </h1>
          
          <div className="w-10" />
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
      </div>

      <Form {...form}>
        <form className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-1 pb-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step-country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <Globe className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">{t('diets_onboarding.step_country_desc') || "Selecciona tu país para personalizar las comidas con ingredientes locales."}</p>
                  </div>
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormControl><CountrySelector value={field.value} onChange={field.onChange} /></FormControl></FormItem>
                  )} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <Activity className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">{t('diets_onboarding.step1_desc')}</p>
                  </div>
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <div className="space-y-3">
                      {activityOptions.map((option) => (
                        <BigOptionButton key={option.id} label={option.label} desc={option.desc} selected={field.value === option.id} onClick={() => field.onChange(option.id)} />
                      ))}
                    </div>
                  )} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <ChefHat className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">{t('diets_onboarding.step2_desc')}</p>
                  </div>
                  <FormField control={form.control} name="preferences" render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {preferencesOptions.map((option) => {
                        const isSelected = field.value?.includes(option.id);
                        return <BigOptionButton key={option.id} label={option.label} icon={<span className="text-xl">{option.icon}</span>} selected={!!isSelected} onClick={() => field.onChange(isSelected ? field.value?.filter(v => v !== option.id) : [...(field.value || []), option.id])} />;
                      })}
                    </div>
                  )} />
                  <p className="text-xs text-center text-muted-foreground mt-4">{t('diets_onboarding.step2_tip')}</p>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="text-center">
                    <Wallet className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">{t('diets_onboarding.step3_desc')}</p>
                  </div>
                  <FormField control={form.control} name="cookingTime" render={({ field }) => (
                    <div className="space-y-3">
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">⏱️ {t('diets_onboarding.cooking_time')}</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {levelOptions.map((opt) => (
                          <button key={opt.id} type="button" onClick={(e) => { e.preventDefault(); field.onChange(opt.id); }} className={cn("p-3 rounded-xl border-2 font-medium transition-all text-center", field.value === opt.id ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted/50")}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  )} />
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <div className="space-y-3">
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">💰 {t('diets_onboarding.budget')}</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {levelOptions.map((opt) => (
                          <button key={opt.id} type="button" onClick={(e) => { e.preventDefault(); field.onChange(opt.id); }} className={cn("p-3 rounded-xl border-2 font-medium transition-all text-center", field.value === opt.id ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted/50")}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 mt-auto">
            {step < TOTAL_STEPS ? (
              <Button type="button" size="lg" className="w-full h-14 text-lg rounded-xl" onClick={nextStep}>
                {t('diets_onboarding.next')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button 
                type="button" 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl" 
                onClick={form.handleSubmit(handleGenerate)} 
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {t('diets_onboarding.generate')}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};