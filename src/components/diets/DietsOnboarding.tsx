import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Wand2, Loader2 } from 'lucide-react';

const preferences = [
  { id: 'vegetarian', label: 'Vegetariano' },
  { id: 'lactose_free', label: 'Sin lactosa' },
  { id: 'sugar_free', label: 'Sin azúcar añadido' },
  { id: 'gluten_free', label: 'Sin gluten' },
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-primary">Tu Plan de Dieta Personalizado</h1>
        <p className="text-muted-foreground text-lg">
          Responde unas preguntas para que nuestra IA cree el plan perfecto para ti.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Nivel de Actividad Física</FormLabel>
                  <FormControl>
                    <ToggleGroup type="single" variant="outline" className="w-full grid grid-cols-2 sm:grid-cols-4" value={field.value} onValueChange={field.onChange}>
                      <ToggleGroupItem value="sedentary">Sedentario</ToggleGroupItem>
                      <ToggleGroupItem value="light">Ligero</ToggleGroupItem>
                      <ToggleGroupItem value="moderate">Moderado</ToggleGroupItem>
                      <ToggleGroupItem value="high">Alto</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="preferences" render={() => (
                <FormItem>
                  <FormLabel className="text-base">Preferencias Dietéticas</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {preferences.map((item) => (
                      <FormField key={item.id} control={form.control} name="preferences" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                              return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));
                            }} />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="cookingTime" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Tiempo para cocinar: <span className="font-bold text-primary capitalize">{field.value}</span></FormLabel>
                  <FormControl><Slider value={[field.value === 'low' ? 0 : field.value === 'medium' ? 1 : 2]} onValueChange={(v) => field.onChange(v[0] === 0 ? 'low' : v[0] === 1 ? 'medium' : 'high')} max={2} step={1} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="budget" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Presupuesto: <span className="font-bold text-primary capitalize">{field.value}</span></FormLabel>
                  <FormControl><Slider value={[field.value === 'low' ? 0 : field.value === 'medium' ? 1 : 2]} onValueChange={(v) => field.onChange(v[0] === 0 ? 'low' : v[0] === 1 ? 'medium' : 'high')} max={2} step={1} /></FormControl>
                </FormItem>
              )} />

              <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                Generar mi Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};