import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Utensils, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAILimit } from '@/hooks/useAILimit';

const formSchema = z.object({
  foodName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional(),
  portionSize: z.enum(['small', 'medium', 'large'], {
    required_error: 'You must select a portion size.',
  }),
});

const ManualFoodEntry = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkLimit, logUsage } = useAILimit();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: '',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          food_name: values.foodName,
          status: 'processing',
        })
        .select()
        .single();
      if (error) throw error;
      return { newEntry: data, formValues: values };
    },
    onSuccess: ({ newEntry, formValues }) => {
      logUsage('manual_food_scan');
      queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
      navigate('/');
      form.reset();
      
      supabase.functions.invoke('analyze-text-food', {
        body: { ...formValues, entry_id: newEntry.id, language: i18n.language },
      }).then(({ error }) => {
        if (error) {
          console.error("Function invocation failed:", error);
          supabase.from('food_entries').update({ status: 'failed', reason: 'Could not start analysis.' }).eq('id', newEntry.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
          });
        }
      });
    },
    onError: (error) => {
      toast.error('Error al iniciar el análisis', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const canProceed = await checkLimit('manual_food_scan', 4, 'daily');
    if (canProceed) {
      mutation.mutate(values);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          {t('manual_food.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('manual_food.name_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('manual_food.name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('manual_food.desc_label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('manual_food.desc_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portionSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('manual_food.portion_label')}</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="w-full grid grid-cols-3"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="small" className="h-12">{t('manual_food.portion_small')}</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="h-12">{t('manual_food.portion_medium')}</ToggleGroupItem>
                      <ToggleGroupItem value="large" className="h-12">{t('manual_food.portion_large')}</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('manual_food.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManualFoodEntry;