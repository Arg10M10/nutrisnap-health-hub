import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Wand2, Loader2, ArrowLeft, ArrowRight, Activity, ChefHat, Wallet, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const preferencesOptions = [
  { id: 'vegetarian', label: 'Vegetariano', icon: '🥗' },
  { id: 'lactose_free', label: 'Sin lactosa', icon: '🥛' },
  { id: 'sugar_free', label: 'Sin azúcar', icon: '🍬' },
  { id: 'gluten_free', label: 'Sin gluten', icon: '🍞' },
];

const activityOptions = [
  { id: 'sedentary', label: 'Sedentario', desc: 'Poco o nada de ejercicio' },
  { id: 'light', label: 'Ligero', desc: 'Ejercicio suave 1-3 días/sem' },
  { id: 'moderate', label: 'Moderado', desc: 'Ejercicio moderado 3-5 días/sem' },
  { id: 'high', label: 'Alto', desc: 'Ejercicio fuerte 6-7 días/sem' },
];

const levelOptions = [
  { id: 'low', label: 'Bajo' },
  { id: 'medium', label: 'Medio' },
  { id: 'high', label: 'Alto' },
];

const formSchema = z.object({
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'high']),
  preferences: z.array(z.string()).optional(),
  cookingTime: z.enum(['low', 'medium', 'high']),
  budget: z.enum(['low', 'medium', 'high']),
});

export const DietsOnboarding = () => {
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        body: { ...values, goal: profile.goal },
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
    onSuccess: async () => {
      await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['weekly_diet_plan', user?.id] });
      toast.success("¡Tu plan de dieta personalizado está listo!");
    },
    onError: (error) => {
      toast.error("No se pudo generar el plan", { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir cualquier intento de submit
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir cualquier intento de submit
    setStep(s => Math.max(s - 1, 1));
  };

  const BigOptionButton = ({ 
    selected, 
    onClick, 
    label, 
    desc,
    icon 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    label: string; 
    desc?: string;
    icon?: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left relative overflow-hidden",
        selected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-muted hover:border-primary/30 bg-card"
      )}
    >
      <div className="flex items-center gap-4 z-10">
        {icon && <div className={cn("p-2 rounded-full", selected ? "bg-white text-primary" : "bg-muted text-muted-foreground")}>{icon}</div>}
        <div>
          <p className={cn("font-bold text-lg", selected ? "text-primary" : "text-foreground")}>{label}</p>
          {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {selected && (
        <div className="bg-primary text-white rounded-full p-1 z-10">
          <Check className="w-5 h-5" />
        </div>
      )}
    </button>
  );

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
            {step === 1 && "Nivel de Actividad"}
            {step === 2 && "Preferencias"}
            {step === 3 && "Detalles Finales"}
          </h1>
          
          <div className="w-10" />
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      <Form {...form}>
        {/* Eliminamos el onSubmit del form para evitar envíos automáticos/accidentales */}
        <form className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-1 pb-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <Activity className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">¿Cuánto te mueves en tu día a día?</p>
                  </div>
                  
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <div className="space-y-3">
                      {activityOptions.map((option) => (
                        <BigOptionButton
                          key={option.id}
                          label={option.label}
                          desc={option.desc}
                          selected={field.value === option.id}
                          onClick={() => field.onChange(option.id)}
                        />
                      ))}
                    </div>
                  )} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <ChefHat className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">Selecciona si tienes alguna preferencia o restricción.</p>
                  </div>

                  <FormField control={form.control} name="preferences" render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {preferencesOptions.map((option) => {
                        const isSelected = field.value?.includes(option.id);
                        return (
                          <BigOptionButton
                            key={option.id}
                            label={option.label}
                            icon={<span className="text-xl">{option.icon}</span>}
                            selected={!!isSelected}
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value?.filter(v => v !== option.id)
                                : [...(field.value || []), option.id];
                              field.onChange(newValue);
                            }}
                          />
                        );
                      })}
                    </div>
                  )} />
                  <p className="text-xs text-center text-muted-foreground mt-4">Si no tienes ninguna, puedes continuar.</p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <Wallet className="w-12 h-12 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-muted-foreground">Ajusta el plan a tu estilo de vida.</p>
                  </div>

                  <FormField control={form.control} name="cookingTime" render={({ field }) => (
                    <div className="space-y-3">
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        ⏱️ Tiempo para cocinar
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {levelOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(opt.id);
                            }}
                            className={cn(
                              "p-3 rounded-xl border-2 font-medium transition-all text-center",
                              field.value === opt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )} />

                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <div className="space-y-3">
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        💰 Presupuesto
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {levelOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(opt.id);
                            }}
                            className={cn(
                              "p-3 rounded-xl border-2 font-medium transition-all text-center",
                              field.value === opt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 mt-auto">
            {step < 3 ? (
              <Button type="button" size="lg" className="w-full h-14 text-lg rounded-xl" onClick={nextStep}>
                Siguiente <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  type="button" 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-xl" 
                  disabled={mutation.isPending}
                  onClick={form.handleSubmit(onSubmit)} // Trigger manual solo al hacer click
                >
                  {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {mutation.isPending ? "Generando con IA... (puede tardar 1 min)" : "Generar mi Plan"}
                </Button>
                {mutation.isPending && (
                  <p className="text-center text-xs text-muted-foreground animate-pulse">
                    La IA está creando un plan único para ti. Por favor espera...
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};