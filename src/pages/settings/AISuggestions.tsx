import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, Wand2, ArrowLeft, Dumbbell, Target, TrendingUp, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAILimit } from '@/hooks/useAILimit';
import { OnboardingOptionCard } from '@/components/settings/OnboardingOptionCard';
import { Card, CardContent } from '@/components/ui/card';

const step1Schema = z.object({
  workoutsPerWeek: z.coerce.number().min(0).max(7),
});
const step2Schema = z.object({
  goalWeight: z.coerce.number().min(30, "El peso objetivo debe ser de al menos 30 kg."),
});
const step3Schema = z.object({
  weeklyRate: z.coerce.number().min(0.1).max(1.5),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

const TOTAL_STEPS = 4;

const AISuggestions = () => {
  const { profile, user, refetchProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const { checkLimit, logUsage } = useAILimit();

  const form = useForm<z.infer<typeof fullSchema>>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      workoutsPerWeek: 3,
      goalWeight: profile?.weight ? Math.round(profile.weight * 0.9) : 65,
      weeklyRate: 0.5,
    },
  });

  useEffect(() => {
    if (profile?.weight) {
      form.reset({
        workoutsPerWeek: 3,
        goalWeight: profile.goal === 'lose_weight' 
          ? Math.round(profile.weight * 0.9) 
          : (profile.goal === 'gain_weight' ? Math.round(profile.weight * 1.1) : profile.weight),
        weeklyRate: 0.5,
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof fullSchema>) => {
      if (!profile || !user) throw new Error("Profile not loaded");
      const { data: suggestions, error: suggestionError } = await supabase.functions.invoke('calculate-macros', {
        body: {
          ...values,
          gender: profile.gender,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          goal: profile.goal,
        },
      });
      if (suggestionError) throw new Error(suggestionError.message);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          goal_calories: suggestions.calories,
          goal_protein: suggestions.protein,
          goal_carbs: suggestions.carbs,
          goal_fats: suggestions.fats,
          goal_sugars: suggestions.sugars,
          goal_weight: values.goalWeight,
          weekly_rate: values.weeklyRate,
        })
        .eq('id', user.id);
      if (updateError) throw updateError;

      return suggestions;
    },
    onSuccess: async () => {
      logUsage('ai_suggestions');
      await refetchProfile();
      toast.success("¡Plan nutricional actualizado con las sugerencias de la IA!");
      navigate(-1);
    },
    onError: (error) => {
      toast.error("Error al generar sugerencias", { description: error.message });
    },
  });

  const handleGenerate = async (values: z.infer<typeof fullSchema>) => {
    const canProceed = await checkLimit('ai_suggestions', 2, 'weekly');
    if (canProceed) {
      mutation.mutate(values);
    }
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) isValid = await form.trigger("workoutsPerWeek");
    if (step === 2) isValid = await form.trigger("goalWeight");
    if (step === 3) isValid = await form.trigger("weeklyRate");
    
    if (isValid) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const pageVariants = {
    initial: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
  };

  const workoutOptions = [
    { value: 1, label: t('ai_suggestions.workouts_light'), description: "1-2 " + t('ai_suggestions.workouts_per_week') },
    { value: 3, label: t('ai_suggestions.workouts_moderate'), description: "3-4 " + t('ai_suggestions.workouts_per_week') },
    { value: 5, label: t('ai_suggestions.workouts_active'), description: "5-6 " + t('ai_suggestions.workouts_per_week') },
    { value: 7, label: t('ai_suggestions.workouts_very_active'), description: "7+ " + t('ai_suggestions.workouts_per_week') },
  ];

  const canContinue = () => {
    if (step === 1) return !form.formState.errors.workoutsPerWeek;
    if (step === 2) return !form.formState.errors.goalWeight;
    if (step === 3) return !form.formState.errors.weeklyRate;
    return true;
  };

  const SummaryItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        {step > 1 && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        )}
        <div className="flex-1" style={{ marginLeft: step === 1 ? '3.5rem' : '0' }}>
          <p className="text-sm font-semibold text-primary">
            Paso {step} de {TOTAL_STEPS}
          </p>
          <Progress value={(step / TOTAL_STEPS) * 100} className="mt-1 h-2" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <X className="w-6 h-6" />
        </Button>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="flex flex-col h-full">
            <div className="flex-1">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                  className="space-y-8"
                >
                  {step === 1 && (
                    <FormField control={form.control} name="workoutsPerWeek" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold text-center block mb-6 flex items-center justify-center gap-2"><Activity /> {t('ai_suggestions.workouts_label')}</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {workoutOptions.map(opt => (
                              <OnboardingOptionCard 
                                key={opt.value}
                                selected={field.value === opt.value}
                                onClick={() => field.onChange(opt.value)}
                                icon={<Dumbbell size={20} />}
                                label={opt.label}
                                description={opt.description}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {step === 2 && (
                    <FormField control={form.control} name="goalWeight" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold text-center block mb-6 flex items-center justify-center gap-2"><Target /> {t('ai_suggestions.goal_weight_label')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="h-24 text-5xl text-center font-bold pr-16" />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-semibold">kg</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {step === 3 && (
                    <FormField control={form.control} name="weeklyRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold text-center block mb-6 flex items-center justify-center gap-2"><TrendingUp /> {t('ai_suggestions.rate_label')}</FormLabel>
                        <p className="text-center text-5xl font-bold text-primary my-4">{field.value} kg/{t('ai_suggestions.week')}</p>
                        <FormControl>
                          <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0.1} max={1.5} step={0.1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {step === 4 && (
                    <div>
                      <h2 className="text-xl font-semibold text-center block mb-6">{t('ai_suggestions.summary_title')}</h2>
                      <Card>
                        <CardContent className="p-4 divide-y">
                          <SummaryItem label={t('ai_suggestions.workouts_label')} value={workoutOptions.find(o => o.value === form.watch('workoutsPerWeek'))?.label} />
                          <SummaryItem label={t('ai_suggestions.goal_weight_label')} value={`${form.watch('goalWeight')} kg`} />
                          <SummaryItem label={t('ai_suggestions.rate_label')} value={`${form.watch('weeklyRate')} kg/${t('ai_suggestions.week')}`} />
                        </CardContent>
                      </Card>
                      <p className="text-center text-xs text-muted-foreground mt-4 px-4">{t('ai_suggestions.disclaimer')}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex-row gap-2 px-0 pt-4 flex">
              {step < TOTAL_STEPS ? (
                <Button size="lg" className="flex-1 h-14 text-lg" onClick={handleNext} type="button" disabled={!canContinue()}>
                  {t('ai_suggestions.continue')}
                </Button>
              ) : (
                <Button type="submit" size="lg" className="flex-1 h-14 text-lg" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {mutation.isPending ? "Generando con IA..." : t('ai_suggestions.generate')}
                </Button>
              )}
            </div>
            {mutation.isPending && (
              <p className="text-center text-sm text-muted-foreground mt-2 animate-pulse">
                La IA está calculando el mejor plan para ti...
              </p>
            )}
          </form>
        </Form>
      </main>
    </div>
  );
};

export default AISuggestions;