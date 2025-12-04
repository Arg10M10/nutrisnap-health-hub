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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Wand2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const step1Schema = z.object({
  workoutsPerWeek: z.number().min(0).max(7),
});
const step2Schema = z.object({
  goalWeight: z.coerce.number().min(30, "El peso objetivo debe ser de al menos 30 kg."),
});
const step3Schema = z.object({
  weeklyRate: z.coerce.number().min(0.1).max(1.5),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

const TOTAL_STEPS = 3;

const AISuggestions = () => {
  const { profile, user, refetchProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

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
        })
        .eq('id', user.id);
      if (updateError) throw updateError;

      return suggestions;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success("¡Plan nutricional actualizado con las sugerencias de la IA!");
      navigate(-1);
    },
    onError: (error) => {
      toast.error("Error al generar sugerencias", { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof fullSchema>) => {
    mutation.mutate(values);
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) isValid = await form.trigger("workoutsPerWeek");
    if (step === 2) isValid = await form.trigger("goalWeight");
    
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

  const canContinue = () => {
    if (step === 1) return !form.formState.errors.workoutsPerWeek;
    if (step === 2) return !form.formState.errors.goalWeight;
    return true;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">
            Paso {step} de {TOTAL_STEPS}
          </p>
          <Progress value={(step / TOTAL_STEPS) * 100} className="mt-1 h-2" />
        </div>
      </header>
      <main className="flex-1 p-4 overflow-hidden flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
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
                        <FormLabel className="text-xl font-semibold text-center block mb-6">{t('ai_suggestions.workouts_label')}</FormLabel>
                        <FormControl>
                          <ToggleGroup type="single" variant="outline" className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2" value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                            <ToggleGroupItem value="1" className="h-14 text-base">1-2</ToggleGroupItem>
                            <ToggleGroupItem value="3" className="h-14 text-base">3-4</ToggleGroupItem>
                            <ToggleGroupItem value="5" className="h-14 text-base">5-6</ToggleGroupItem>
                            <ToggleGroupItem value="7" className="h-14 text-base">7+</ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {step === 2 && (
                    <FormField control={form.control} name="goalWeight" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold text-center block mb-6">{t('ai_suggestions.goal_weight_label')}</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-14 text-lg text-center" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {step === 3 && (
                    <FormField control={form.control} name="weeklyRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold text-center block mb-6">{t('ai_suggestions.rate_label')}</FormLabel>
                        <p className="text-center text-4xl font-bold text-primary my-4">{field.value} kg/{t('ai_suggestions.week')}</p>
                        <FormControl>
                          <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0.1} max={1.5} step={0.1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex-row gap-2 px-0 pt-4 flex">
              {step > 1 && (
                <Button variant="outline" size="lg" className="flex-1 h-14 text-lg" onClick={handleBack} type="button">
                  <ArrowLeft className="mr-2 h-5 w-5" /> {t('ai_suggestions.back')}
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button size="lg" className="flex-1 h-14 text-lg" onClick={handleNext} type="button" disabled={!canContinue()}>
                  {t('ai_suggestions.continue')}
                </Button>
              ) : (
                <Button type="submit" size="lg" className="flex-1 h-14 text-lg" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {t('ai_suggestions.generate')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default AISuggestions;