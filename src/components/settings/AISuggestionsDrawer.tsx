import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  workoutsPerWeek: z.number().min(0).max(7),
  goalWeight: z.coerce.number().min(30, "Goal weight must be at least 30 kg."),
  weeklyRate: z.coerce.number().min(0.1).max(1.5),
});

interface AISuggestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestions: (suggestions: any) => void;
}

const AISuggestionsDrawer = ({ isOpen, onClose, onApplySuggestions }: AISuggestionsDrawerProps) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  }, [profile, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!profile) throw new Error("Profile not loaded");
      const { data, error } = await supabase.functions.invoke('calculate-macros', {
        body: {
          ...values,
          gender: profile.gender,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          goal: profile.goal,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      onApplySuggestions(data);
      onClose();
    },
    onError: (error) => {
      // Handle error, maybe show a toast
      console.error(error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>{t('ai_suggestions.title')}</DrawerTitle>
          <DrawerDescription>{t('ai_suggestions.subtitle')}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="workoutsPerWeek" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ai_suggestions.workouts_label')}</FormLabel>
                  <FormControl>
                    <ToggleGroup type="single" variant="outline" className="w-full grid grid-cols-4" value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <ToggleGroupItem value="1">1-2</ToggleGroupItem>
                      <ToggleGroupItem value="3">3-4</ToggleGroupItem>
                      <ToggleGroupItem value="5">5-6</ToggleGroupItem>
                      <ToggleGroupItem value="7">7+</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="goalWeight" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ai_suggestions.goal_weight_label')}</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weeklyRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ai_suggestions.rate_label')} ({field.value} kg/{t('ai_suggestions.week')})</FormLabel>
                  <FormControl>
                    <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0.1} max={1.5} step={0.1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DrawerFooter className="flex-row gap-2 px-0">
                <Button type="submit" size="lg" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {t('ai_suggestions.generate')}
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AISuggestionsDrawer;